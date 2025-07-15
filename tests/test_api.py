import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_register_login_and_transaction():
    # Register
    resp = client.post("/register", json={"username": "alice", "password": "secret"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    hdrs = {"Authorization": f"Bearer {token}"}

    # Get jars
    jars = client.get("/jars", headers=hdrs)
    assert jars.status_code == 200
    data = jars.json()
    assert "Necessity" in data

    # Add transaction triggers alert when exceeds limit
    tx = client.post("/transactions", json={"description": "coffee", "amount": 1000}, headers=hdrs)
    assert tx.status_code == 200

    # Alerts should be present
    alerts = client.get("/alerts", headers=hdrs)
    assert alerts.status_code == 200
    assert len(alerts.json()) >= 1