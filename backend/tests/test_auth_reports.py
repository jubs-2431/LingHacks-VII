from urllib.parse import urlparse

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.models import AuditEvent, Report
from app.db.session import SessionLocal
from main import app


def register(client: TestClient, email: str = "person@example.com") -> dict:
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": "a secure password 123"},
    )
    assert response.status_code == 201
    return response.json()


def auth_header(tokens: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def test_register_login_refresh_rotation_and_logout():
    with TestClient(app) as client:
        registered = register(client)
        me = client.get("/api/auth/me", headers=auth_header(registered))
        assert me.status_code == 200
        assert me.json()["email"] == "person@example.com"

        login = client.post(
            "/api/auth/login",
            json={
                "email": "PERSON@example.com",
                "password": "a secure password 123",
            },
        )
        assert login.status_code == 200
        login_tokens = login.json()

        refreshed = client.post(
            "/api/auth/refresh",
            json={"refresh_token": login_tokens["refresh_token"]},
        )
        assert refreshed.status_code == 200
        rotated_tokens = refreshed.json()
        assert rotated_tokens["refresh_token"] != login_tokens["refresh_token"]

        reused = client.post(
            "/api/auth/refresh",
            json={"refresh_token": login_tokens["refresh_token"]},
        )
        assert reused.status_code == 401

        logout = client.post(
            "/api/auth/logout",
            json={"refresh_token": rotated_tokens["refresh_token"]},
        )
        assert logout.status_code == 204
        assert client.post(
            "/api/auth/refresh",
            json={"refresh_token": rotated_tokens["refresh_token"]},
        ).status_code == 401


def test_report_is_encrypted_owner_scoped_and_share_is_access_limited():
    plaintext = "You must pay a $500 penalty within 10 days."
    with TestClient(app) as client:
        owner = register(client)
        created_response = client.post(
            "/api/reports",
            headers=auth_header(owner),
            json={
                "text": plaintext,
                "document_type": "financial",
                "filename": "agreement.txt",
                "pages": [
                    {
                        "page_number": 1,
                        "start": 0,
                        "end": len(plaintext),
                        "used_ocr": False,
                    }
                ],
            },
        )
        assert created_response.status_code == 201
        created = created_response.json()
        assert created["text"] == plaintext
        assert created["analysis"]["clauses"][0]["page_numbers"] == [1]

        with SessionLocal() as db:
            stored = db.scalar(select(Report).where(Report.id == created["id"]))
            assert stored is not None
            assert plaintext.encode() not in stored.encrypted_text
            assert plaintext.encode() not in stored.encrypted_analysis
            assert b"agreement.txt" not in (stored.encrypted_filename or b"")

        outsider = register(client, "other@example.com")
        assert client.get(
            f"/api/reports/{created['id']}",
            headers=auth_header(outsider),
        ).status_code == 404

        share_response = client.post(
            f"/api/reports/{created['id']}/shares",
            headers=auth_header(owner),
            json={"expires_in_hours": 1, "max_accesses": 1},
        )
        assert share_response.status_code == 201
        token = urlparse(share_response.json()["share_url"]).path.rsplit("/", 1)[-1]
        shared = client.get(f"/api/shares/{token}")
        assert shared.status_code == 200
        assert shared.json()["text"] == plaintext
        assert client.get(f"/api/shares/{token}").status_code == 404

        assert client.delete(
            f"/api/reports/{created['id']}",
            headers=auth_header(owner),
        ).status_code == 204
        assert client.get(
            f"/api/reports/{created['id']}",
            headers=auth_header(owner),
        ).status_code == 404

        with SessionLocal() as db:
            events = db.scalars(
                select(AuditEvent).where(AuditEvent.report_id == created["id"])
            ).all()
            assert {
                "report.created",
                "share.created",
                "share.accessed",
                "report.deleted",
            }.issubset({event.event_type for event in events})


def test_duplicate_registration_and_weak_password_are_rejected():
    with TestClient(app) as client:
        register(client)
        duplicate = client.post(
            "/api/auth/register",
            json={
                "email": "person@example.com",
                "password": "another secure password",
            },
        )
        assert duplicate.status_code == 409
        weak = client.post(
            "/api/auth/register",
            json={"email": "weak@example.com", "password": "short"},
        )
        assert weak.status_code == 422
