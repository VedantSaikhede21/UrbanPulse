import uuid
from sqlalchemy import text
from sqlalchemy.orm import Session
from geoalchemy2 import WKTElement
from app.db.session import engine, SessionLocal, Base
from app.db.models import Ward, Citizen, Officer, Ticket, AuditLog

def seed_db():
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
        db.query(Citizen).delete()
        db.query(Ward).delete()
        db.commit()

        # 4. Seed Wards (using mock coordinates around a central city grid)
        print("Seeding Wards...")
        ward_data = [
            {
                "name": "Ward 1 - Market Square",
                "boundary": "POLYGON((77.58 12.96, 77.60 12.96, 77.60 12.98, 77.58 12.98, 77.58 12.96))",
                "uhs_score": 88.5
            },
            {
                "name": "Ward 2 - Greenfield Suburb",
                "boundary": "POLYGON((77.60 12.96, 77.62 12.96, 77.62 12.98, 77.60 12.98, 77.60 12.96))",
                "uhs_score": 94.2
            },
            {
                "name": "Ward 3 - Industrial Corridor",
                "boundary": "POLYGON((77.58 12.94, 77.60 12.94, 77.60 12.96, 77.58 12.96, 77.58 12.94))",
                "uhs_score": 72.1
            }
        ]
        
        for w in ward_data:
            ward = Ward(
                name=w["name"],
                boundary=WKTElement(w["boundary"], srid=4326),
                uhs_score=w["uhs_score"]
            )
            db.add(ward)
        db.commit()

        # 5. Seed Citizens
        print("Seeding Citizens...")
        citizen_alice = Citizen(phone="+919876543210", name="Alice Sharma", reputation_score=110)
        citizen_bob = Citizen(phone="+919876543211", name="Bob Fernandes", reputation_score=85)
        citizen_charlie = Citizen(phone="+919876543212", name="Charlie Patel", reputation_score=150)
        
        db.add_all([citizen_alice, citizen_bob, citizen_charlie])
        db.commit()

        # 6. Seed Officers
        print("Seeding Officers...")
        officer_dave = Officer(name="Dave Kumar", department="Roads", is_active=True)
        officer_elisa = Officer(name="Elisa Roy", department="Water", is_active=True)
        officer_frank = Officer(name="Frank D'Souza", department="Sanitation", is_active=True)
        officer_grace = Officer(name="Grace Murthy", department="Electrical", is_active=True)
        
        db.add_all([officer_dave, officer_elisa, officer_frank, officer_grace])
        db.commit()

        # 7. Seed Tickets
        print("Seeding Tickets...")
        ticket_1 = Ticket(
            citizen_id=citizen_alice.id,
            latitude=12.9715,
            longitude=77.5945,
            category="Roads & Potholes",
            severity="medium",
            description="Deep pothole right near the bus stop intersection. Hazardous for bikers.",
            status="assigned",
            priority_score=2,
            assigned_officer_id=officer_dave.id
        )
        ticket_2 = Ticket(
            citizen_id=citizen_bob.id,
            latitude=12.9730,
            longitude=77.6120,
            category="Water Leak",
            severity="high",
            description="Main pipe line burst, water is spraying over the sidewalk.",
            status="reported",
            priority_score=3
        )
        ticket_3 = Ticket(
            citizen_id=citizen_charlie.id,
            latitude=12.9510,
            longitude=77.5910,
            category="Garbage & Sanitation",
            severity="low",
            description="Overflowing dumpsters behind the commercial market space.",
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
