"""Backend API tests for STUDLYF AI - Phase 2 (auth, workspace, newsletter) + Phase 1 regression."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

# Pre-seeded test session (see /app/memory/test_credentials.md)
TEST_TOKEN = "test_session_1782634396190"
TEST_USER_ID = "user_test_1782634396190"
SEED_PROJECT_ID = "proj_mqxihr9g"
RESEND_VERIFIED_EMAIL = "24r01a67b6@cmrithyderabad.edu.in"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth():
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TEST_TOKEN}",
    })
    return s


# ---------- Phase-1 regression ----------
class TestRegressionPhase1:
    def test_root_alive(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("message") == "STUDLYF AI API live"

    def test_signup_idempotent(self, api):
        email = f"TEST_reg_{uuid.uuid4().hex[:8]}@example.com"
        p = {"name": "R", "email": email, "company": "C", "role": "Founder"}
        r1 = api.post(f"{BASE_URL}/api/signup", json=p, timeout=15)
        r2 = api.post(f"{BASE_URL}/api/signup", json=p, timeout=15)
        assert r1.status_code == 200 and r2.status_code == 200
        assert r1.json()["id"] == r2.json()["id"]

    def test_chat(self, api):
        r = api.post(f"{BASE_URL}/api/chat",
                     json={"message": "One sentence: what is STUDLYF AI?"}, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d.get("reply"), str) and len(d["reply"].strip()) > 0


# ---------- Auth ----------
class TestAuth:
    def test_me_without_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 401

    def test_me_with_bearer(self, auth):
        r = auth.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user_id"] == TEST_USER_ID
        assert "@" in d["email"]
        assert isinstance(d.get("name"), str)

    def test_me_with_bad_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": "Bearer not-a-real-token"}, timeout=10)
        assert r.status_code == 401


# ---------- Workspace: Projects ----------
class TestProjects:
    def test_list_projects_requires_auth(self, api):
        r = api.get(f"{BASE_URL}/api/workspace/projects", timeout=10)
        assert r.status_code == 401

    def test_list_projects_returns_seeded(self, auth):
        r = auth.get(f"{BASE_URL}/api/workspace/projects", timeout=10)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list) and len(items) >= 1
        ids = [p["project_id"] for p in items]
        assert SEED_PROJECT_ID in ids
        seed = next(p for p in items if p["project_id"] == SEED_PROJECT_ID)
        assert seed["name"] == "Lumen Labs"
        assert seed["user_id"] == TEST_USER_ID

    def test_project_crud_cycle(self, auth):
        # CREATE
        payload = {
            "name": f"TEST_Proj_{uuid.uuid4().hex[:6]}",
            "tagline": "A test startup",
            "industry": "SaaS",
            "stage": "Idea",
        }
        rc = auth.post(f"{BASE_URL}/api/workspace/projects", json=payload, timeout=15)
        assert rc.status_code == 200, rc.text
        created = rc.json()
        pid = created["project_id"]
        assert created["name"] == payload["name"]
        assert created["user_id"] == TEST_USER_ID

        # GET (list) verifies persistence
        rl = auth.get(f"{BASE_URL}/api/workspace/projects", timeout=10)
        assert pid in [p["project_id"] for p in rl.json()]

        # PATCH
        ru = auth.patch(f"{BASE_URL}/api/workspace/projects/{pid}",
                        json={"tagline": "Updated tagline"}, timeout=10)
        assert ru.status_code == 200, ru.text
        assert ru.json()["tagline"] == "Updated tagline"

        # PATCH non-existent -> 404
        r404 = auth.patch(f"{BASE_URL}/api/workspace/projects/proj_doesnotexist",
                         json={"tagline": "x"}, timeout=10)
        assert r404.status_code == 404

        # DELETE
        rd = auth.delete(f"{BASE_URL}/api/workspace/projects/{pid}", timeout=10)
        assert rd.status_code == 200
        assert rd.json().get("ok") is True

        # confirm gone
        rl2 = auth.get(f"{BASE_URL}/api/workspace/projects", timeout=10)
        assert pid not in [p["project_id"] for p in rl2.json()]


# ---------- Workspace: Generations ----------
GENERATION_KINDS_TO_TEST = ["swot", "marketing_plan", "one_minute_pitch"]
_generated_ids: list[str] = []


class TestGenerations:
    @pytest.mark.parametrize("kind", GENERATION_KINDS_TO_TEST)
    def test_generate_each_kind(self, auth, kind):
        r = auth.post(f"{BASE_URL}/api/workspace/generate",
                      json={"project_id": SEED_PROJECT_ID, "kind": kind},
                      timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["kind"] == kind
        assert d["project_id"] == SEED_PROJECT_ID
        assert d["user_id"] == TEST_USER_ID
        assert isinstance(d["content"], str)
        assert len(d["content"].strip()) > 100, "Generated content suspiciously short"
        assert "generation_id" in d
        _generated_ids.append(d["generation_id"])

    def test_generate_requires_auth(self, api):
        r = api.post(f"{BASE_URL}/api/workspace/generate",
                     json={"project_id": SEED_PROJECT_ID, "kind": "swot"}, timeout=15)
        assert r.status_code == 401

    def test_generate_invalid_kind_422(self, auth):
        r = auth.post(f"{BASE_URL}/api/workspace/generate",
                      json={"project_id": SEED_PROJECT_ID, "kind": "not_a_kind"}, timeout=15)
        assert r.status_code == 422

    def test_generate_unknown_project_404(self, auth):
        r = auth.post(f"{BASE_URL}/api/workspace/generate",
                      json={"project_id": "proj_unknownxxx", "kind": "swot"}, timeout=30)
        assert r.status_code == 404

    def test_list_generations_filtered(self, auth):
        r = auth.get(f"{BASE_URL}/api/workspace/generations",
                     params={"project_id": SEED_PROJECT_ID}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        for it in items:
            assert it["project_id"] == SEED_PROJECT_ID
            assert it["user_id"] == TEST_USER_ID
        # at least the ones we just made should be there
        present_ids = [it["generation_id"] for it in items]
        for gid in _generated_ids:
            assert gid in present_ids

    def test_delete_generation(self, auth):
        if not _generated_ids:
            pytest.skip("No generation to delete")
        gid = _generated_ids[0]
        rd = auth.delete(f"{BASE_URL}/api/workspace/generations/{gid}", timeout=10)
        assert rd.status_code == 200
        # Confirm removed
        rl = auth.get(f"{BASE_URL}/api/workspace/generations",
                      params={"project_id": SEED_PROJECT_ID}, timeout=10)
        assert gid not in [it["generation_id"] for it in rl.json()]

        # Delete again -> 404
        rd2 = auth.delete(f"{BASE_URL}/api/workspace/generations/{gid}", timeout=10)
        assert rd2.status_code == 404


# ---------- Newsletter ----------
class TestNewsletter:
    def test_subscribe_new_then_already_subscribed(self, api):
        email = f"TEST_news_{uuid.uuid4().hex[:8]}@example.com"
        r1 = api.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=30)
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["ok"] is True
        assert d1["already_subscribed"] is False
        # email_sent may be true OR false (Resend test-mode). Accept both.
        assert "email_sent" in d1

        r2 = api.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=10)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["ok"] is True
        assert d2["already_subscribed"] is True

    def test_subscribe_invalid_email_422(self, api):
        r = api.post(f"{BASE_URL}/api/newsletter", json={"email": "not-an-email"}, timeout=10)
        assert r.status_code in (400, 422)

    def test_subscribe_verified_resend_inbox(self, api):
        # Use unique address so we hit the new-subscriber branch; but Resend will only really
        # deliver to the verified inbox. We just call with the verified inbox once; subsequent
        # runs may be already_subscribed which is fine.
        r = api.post(f"{BASE_URL}/api/newsletter",
                     json={"email": RESEND_VERIFIED_EMAIL}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        # If first time -> email_sent must be True; if already subscribed -> already_subscribed True
        if d.get("already_subscribed"):
            pytest.skip("Verified inbox already subscribed in prior run — cannot verify email_sent=True path")
        else:
            assert d.get("email_sent") is True, f"Expected email_sent=True for verified Resend inbox; got {d}"
