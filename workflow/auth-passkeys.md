# Authentication

MINT supports three complementary authentication paths: a classic email + password flow that issues JWTs, WebAuthn / passkey login that uses a hardware security key, Touch ID, Windows Hello, or another passkey-capable authenticator, and optional SWITCH edu-ID single sign-on.

> [Screenshot: login page showing email-and-password form, "Sign in with SWITCH edu-ID", and "Sign in with passkey" buttons]

## At a glance

| Method | What you remember | Server stores | Cross-device |
|--------|-------------------|---------------|--------------|
| **Password + JWT** | A password | A salted password hash + your JWT secret | Yes |
| **Passkey (WebAuthn)** | Nothing - your device authenticates you | A public key only | Per-device unless you sync via iCloud Keychain / Google Password Manager |
| **SWITCH edu-ID** | Your institutional edu-ID login | A linked external identity and normal MINT user record | Yes |

All methods can be enabled at the same time. Users may sign in with a password, register a passkey from their profile, link an edu-ID account, and then choose the available method on the login page.

## Sign in with email + password

Standard form on the login page. On success, MINT issues a bearer JWT with a 24-hour default expiry and also sets an HttpOnly `mint_access_token` cookie for server-side checks such as plugin frontend access. The frontend keeps the bearer token for API calls and can refresh it through `/api/auth/refresh`.

| Setting | Default | Where |
|---------|---------|-------|
| Token TTL | 1,440 minutes | `auth.tokenExpireMinutes` in `config.json` |
| JWT secret | Auto-generated when omitted | `auth.jwtSecretKey` (set a stable 32+ byte secret for production; never commit it) |
| Password hashing | bcrypt, cost 12 | Implementation detail of `auth_service` |

::: warning Rotate the JWT secret carefully
Rotating `auth.jwtSecretKey` invalidates every active session, signing every user out. Plan rotations during a maintenance window.
:::

## Sign in with a passkey

If passkeys are enabled (`auth.enablePasskey: true`), users can register one or more authenticators from **Your account -> Security**.

> [Screenshot: Your account -> Security listing registered passkeys with device names and creation timestamps]

Each registered passkey carries:

- A friendly name (e.g., "Work laptop", "YubiKey 5")
- The credential ID
- A public key
- A creation timestamp

To log in with a passkey, click **Sign in with passkey** on the login page; your browser walks you through device unlock and the server verifies the signature. No password is involved.

## Recovery and lockout

| Scenario | Resolution |
|----------|------------|
| Lost passkey, password still known | Sign in with the password, then remove the old credential and register a new passkey from **Your account -> Security**. |
| Forgotten password | An admin with `users.manage` can set a new password from **Admin -> People -> Users**. There is no self-service email reset flow in the current core platform. |
| All authenticators lost | Ask an admin to reset the password after the lab's normal out-of-band identity check, then register a fresh passkey. |
| Account compromised | Admin disables or deletes the user from **Admin -> People -> Users**, then re-creates or re-enables access after a password reset and passkey review. |

## SWITCH edu-ID SSO

When `sso.eduid.enabled` is `true`, the login page shows **Sign in with SWITCH edu-ID**. MINT starts an OpenID Connect authorization flow at `/api/auth/sso/eduid/login`, handles the callback at `/api/auth/sso/eduid/callback`, and completes browser handoff through `/api/auth/sso/eduid/complete`.

Minimal config:

```json
{
  "server": {
    "externalUrl": "https://mint.example.org"
  },
  "sso": {
    "eduid": {
      "enabled": true,
      "clientId": "<edu-id client id>",
      "clientSecret": "<edu-id client secret>"
    }
  }
}
```

Key requirements:

- The platform's required PostgreSQL database must be reachable so MINT can store linked user identities.
- `server.externalUrl` must be the public HTTPS URL so MINT can build the callback URL.
- `openid` must remain in `sso.eduid.scopes`.
- Keep at least one local password/passkey admin account as break-glass access in case the external provider is unavailable.

If `autoProvision` is enabled, a successful first edu-ID login creates the MINT user automatically. The stable edu-ID claim defaults to `swissEduIDUniqueID`, while the local username defaults to the `email` claim.

## Rate limiting

Auth routes are rate-limited to **20 requests per 60 seconds per IP** (`api/middleware/rate_limit.py`) for `/api/auth` and `/api/passkey`. `X-Forwarded-For` is trusted only when the request comes through a local proxy, so configure your reverse proxy to pass the original client IP to the backend.

## Audit and observability

MINT can instrument FastAPI, SQLAlchemy, and logging with OpenTelemetry when tracing is configured. Authentication requests then appear as normal request spans and logs; MINT does not persist a separate auth audit log itself, so production deployments should ship backend logs to the lab's existing log store.

## Next

→ [Members & roles](/workflow/members-roles) — what an authenticated user can do
→ [Permissions](/reference/permissions) — full RBAC reference
