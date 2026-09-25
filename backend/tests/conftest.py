"""Shared helpers for backend integration tests.

Production auth resolves staff roles from the officers table (single
source of truth) — a bare JWT role claim is not enough. Tests that need
a staff identity must provision the Officer row first and remove it
after, otherwise staff tokens downgrade to citizen and staff endpoints
answer 401/403.
"""
from sqlalchemy import text

VALID_STAFF_ROLES = ("officer", "dept_head", "admin", "super_admin")


def provision_officer(engine, officer_id, role="officer", name="Test Officer", department="Roads"):
    assert role in VALID_STAFF_ROLES, f"unknown staff role {role}"
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO officers (id, name, department, role, is_active) "
                "VALUES (:id, :name, :dept, :role, true) "
                "ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, is_active = true"
            ),
            {"id": officer_id, "name": name, "dept": department, "role": role},
        )


def delete_officer(engine, officer_id):
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM officers WHERE id = :id"), {"id": officer_id})
