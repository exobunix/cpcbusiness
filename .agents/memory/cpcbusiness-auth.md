---
name: CPCBusiness auth scheme
description: How authentication works in the CPCBusiness platform
---

Auth uses a custom base64 token (no JWT library dependency).

**Token format:** `base64(userId:email:timestamp)`  
**Password hashing:** `SHA256(password + "cpc_salt")` — hex digest stored in `users.password_hash`  
**Storage:** `localStorage` under key `cpc_token`  
**Custom fetch client:** reads token via `getAuthToken()` from `artifacts/cpcbusiness/src/lib/auth.ts`, sends as `Authorization: Bearer <token>` header.

**Demo credentials:**
- Admin: `admin@cpcbusiness.com` / `admin123`
- Client: `client@example.com` / `client123`

**Why:** Chosen to avoid JWT library dependency while still having a verifiable server-side check. The login endpoint verifies the hash and issues a token; middleware on `/api/admin/*` and `/api/client/*` validates it.
