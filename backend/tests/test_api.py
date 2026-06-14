from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["X-Request-ID"]


def test_analyze_rejects_empty_text():
    response = client.post(
        "/api/analyze",
        json={"text": "   ", "document_type": "lease"},
    )
    assert response.status_code == 422


def test_analyze_rejects_unknown_document_type():
    response = client.post(
        "/api/analyze",
        json={"text": "A valid sentence.", "document_type": "unknown"},
    )
    assert response.status_code == 422


def test_analyze_returns_rich_findings():
    response = client.post(
        "/api/analyze",
        json={
            "text": "You must pay a $50 fee within 10 days.",
            "document_type": "financial",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["analysis_version"] == "2.1.0"
    assert body["document_type"] == "financial"
    assert body["document_stats"]["findings"] == 3
    assert all("confidence" in finding for finding in body["clauses"])
    assert all("trigger_spans" in finding for finding in body["clauses"])


def test_extract_rejects_spoofed_pdf():
    response = client.post(
        "/api/extract-text",
        files={"file": ("fake.pdf", b"not a pdf", "application/pdf")},
    )
    assert response.status_code == 415
    assert response.json()["detail"] == "The uploaded file is not a valid PDF."


def test_extract_rejects_unsupported_type():
    response = client.post(
        "/api/extract-text",
        files={"file": ("notes.txt", b"plain text", "text/plain")},
    )
    assert response.status_code == 415
