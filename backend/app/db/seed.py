import uuid
from sqlalchemy import text
from sqlalchemy.orm import Session
from geoalchemy2 import WKTElement
from app.db.session import engine, SessionLocal, Base
from app.db.models import Ward, Citizen, Officer, Department, Ticket, AuditLog
from app.city import CITY_NAME, WARDS
from app.db.seed_locations import location_for, place_for

def seed_db():
    from app.config import settings
    if settings.ENV != "development":
        raise RuntimeError("seed_db() is destructive and refuses to run outside the development environment")
    print("Initializing database schema...")
    
    # 1. Ensure PostGIS and UUID extensions are enabled
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        print("Database extensions configured.")

    # 2. Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

    # 3. Create the spatial trigger for location_geom if it doesn't exist
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE OR REPLACE FUNCTION update_ticket_geom()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.location_geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """))
        conn.execute(text("""
            DROP TRIGGER IF EXISTS trigger_update_ticket_geom ON tickets;
        """))
        conn.execute(text("""
            CREATE TRIGGER trigger_update_ticket_geom
            BEFORE INSERT OR UPDATE OF latitude, longitude ON tickets
            FOR EACH ROW
            EXECUTE FUNCTION update_ticket_geom();
        """))
        print("Spatial triggers configured.")

    db: Session = SessionLocal()
    try:
        # Clear existing data to prevent duplicates
        print("Clearing existing data...")
        db.query(AuditLog).delete()
        db.query(Ticket).delete()
        db.query(Officer).delete()
        db.query(Department).delete()
        db.query(Citizen).delete()
        db.query(Ward).delete()
        db.commit()

        # 4. Seed Wards
        # Ward names and boundaries come from app.city, which is scoped to
        # Navi Mumbai, Maharashtra. These used to be Bengaluru polygons
        # (77.58-77.62 / 12.94-12.98) with invented names like
        # "Market Square" / "Greenfield Suburb".
        print(f"Seeding Wards for {CITY_NAME}...")
        for w in WARDS:
            ward = Ward(
                name=w.name,
                boundary=WKTElement(w.wkt, srid=4326),
                uhs_score=w.uhs_score
            )
            db.add(ward)
        db.commit()

        # 5. Seed Citizens
        print("Seeding Citizens...")
        citizen_alice = Citizen(email="alice@example.com", name="Alice Sharma", reputation_score=110)
        citizen_bob = Citizen(email="bob@example.com", name="Bob Fernandes", reputation_score=85)
        citizen_charlie = Citizen(email="charlie@example.com", name="Charlie Patel", reputation_score=150)
        
        db.add_all([citizen_alice, citizen_bob, citizen_charlie])
        db.commit()

        # 6. Seed Departments and link Officers
        print("Seeding Departments...")
        dept_roads = Department(name="Roads", code="roads", is_active=True)
        dept_water = Department(name="Water", code="water", is_active=True)
        dept_sanitation = Department(name="Sanitation", code="sanitation", is_active=True)
        dept_electrical = Department(name="Electrical", code="electrical", is_active=True)
        db.add_all([dept_roads, dept_water, dept_sanitation, dept_electrical])
        db.commit()

        print("Seeding Officers...")
        # NOTE: `app.auth.deps` takes a staff user's role from THIS table, not
        # from the JWT. Seeding only field officers meant no admin/super_admin
        # row existed, so every admin-only endpoint (notably /api/audit)
        # answered 403 for every user in the deployment.
        officer_dave = Officer(name="Dave Kumar", role="officer", department="Roads", department_id=dept_roads.id, is_active=True)
        officer_elisa = Officer(name="Elisa Roy", role="officer", department="Water", department_id=dept_water.id, is_active=True)
        officer_frank = Officer(name="Frank D'Souza", role="officer", department="Sanitation", department_id=dept_sanitation.id, is_active=True)
        officer_grace = Officer(name="Grace Murthy", role="officer", department="Electrical", department_id=dept_electrical.id, is_active=True)

        # NOTE: `officers.department` carries a CHECK constraint
        # (Roads|Water|Sanitation|Electrical). Admin rows are city-wide, so
        # they are attached to a real department to satisfy it — authorisation
        # reads `role`, not `department`.
        head_roads = Officer(name="Anita Desai", role="dept_head", department="Roads", department_id=dept_roads.id, is_active=True)
        head_water = Officer(name="Rohit Salvi", role="dept_head", department="Water", department_id=dept_water.id, is_active=True)
        city_admin = Officer(name="Meera Iyer", role="admin", department="Roads", is_active=True)
        super_admin = Officer(name="Karthik Rao", role="super_admin", department="Roads", is_active=True)

        db.add_all([
            officer_dave, officer_elisa, officer_frank, officer_grace,
            head_roads, head_water, city_admin, super_admin,
        ])
        db.commit()

        # 7. Seed Tickets
        # Coordinates resolve inside real Navi Mumbai wards so the
        # ST_Contains ward join in analytics.py attributes them correctly.
        print("Seeding Tickets...")
        ticket_1 = Ticket(
            citizen_id=citizen_alice.id,
            latitude=location_for("pothole")[0],
            longitude=location_for("pothole")[1],
            location_source="gps",
            category="Roads & Potholes",
            severity="medium",
            description=f"Deep pothole right near the bus stop at {place_for('pothole')}. Hazardous for bikers.",
            status="assigned",
            priority_score=2,
            assigned_officer_id=officer_dave.id
        )
        ticket_2 = Ticket(
            citizen_id=citizen_bob.id,
            latitude=location_for("water_leak")[0],
            longitude=location_for("water_leak")[1],
            location_source="gps",
            category="Water Leak",
            severity="high",
            description=f"Main pipe line burst near {place_for('water_leak')}, water is spraying over the sidewalk.",
            status="reported",
            priority_score=3
        )
        ticket_3 = Ticket(
            citizen_id=citizen_charlie.id,
            latitude=location_for("garbage")[0],
            longitude=location_for("garbage")[1],
            location_source="gps",
            category="Garbage & Sanitation",
            severity="low",
            description=f"Overflowing dumpsters behind the commercial market space at {place_for('garbage')}.",
            status="in_progress",
            priority_score=1,
            assigned_officer_id=officer_frank.id
        )
        
        db.add_all([ticket_1, ticket_2, ticket_3])
        db.commit()

        print("Database seeded successfully with all initial data models!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
