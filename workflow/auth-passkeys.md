# Authentication

MINT supports two complementary authentication methods: a classic email + password flow that issues JWTs, and WebAuthn / passkey login that uses a hardware security key, Touch ID, Windows Hello, or any other passkey-capable authenticator.

> [Screenshot: login page showing email-and-password form and "Sign in with passkey" button]

## At a glance

| Method | What you remember | Server stores | Cross-device |
|--------|-------------------|---------------|--------------|
| **Password + JWT** | A password | A salted password hash + your JWT secret | Yes |
| **Passkey (WebAuthn)** | Nothing - your device authenticates you | A public key only | Per-device unless you sync via iCloud Keychain / Google Password Manager |

Both methods can be enabled at the same time. Users sign in with a password first, register a passkey from their profile, and can then choose either method on the login page.

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

If passkeys are enabled (`auth.enablePasskey: true`), users can register one or more authenticators from the profile **Passkey** tab.

> [Screenshot: profile Passkey tab listing registered credentials with device names and creation timestamps]

Each registered passkey carries:

- A friendly name (e.g., "Work laptop", "YubiKey 5")
- The credential ID
- A public key
- A creation timestamp

To log in with a passkey, click **Sign in with passkey** on the login page; your browser walks you through device unlock and the server verifies the signature. No password is involved.

## Recovery and lockout

| Scenario | Resolution |
|----------|------------|
| Lost passkey, password still known | Sign in with the password, then remove the old credential and register a new passkey from the profile **Passkey** tab. |
| Forgotten password | An admin with `users.manage` can set a new password from **Admin → Users**. There is no self-service email reset flow in the current core platform. |
| All authenticators lost | Ask an admin to reset the password after the lab's normal out-of-band identity check, then register a fresh passkey. |
| Account compromised | Admin disables or deletes the user from **Admin → Users**, then re-creates or re-enables access after a password reset and passkey review. |

## External identity providers

The current core configuration covers local password/JWT auth and WebAuthn passkeys. It does not include a built-in SSO/OIDC provider block or a local-login toggle in `config.json`. If a deployment needs organization SSO, put MINT behind a lab-managed reverse proxy or external access gateway and keep a break-glass MINT admin account available.

## Rate limiting

Auth routes are rate-limited to **20 requests per 60 seconds per IP** (`api/middleware/rate_limit.py`) for `/api/auth` and `/api/passkey`. `X-Forwarded-For` is trusted only when the request comes through a local proxy, so configure your reverse proxy to pass the original client IP to the backend.

## Audit and observability

MINT can instrument FastAPI, SQLAlchemy, and logging with OpenTelemetry when tracing is configured. Authentication requests then appear as normal request spans and logs; MINT does not persist a separate auth audit log itself, so production deployments should ship backend logs to the lab's existing log store.

## Next

→ [Members & roles](/workflow/members-roles) — what an authenticated user can do
→ [Permissions](/reference/permissions) — full RBAC reference
