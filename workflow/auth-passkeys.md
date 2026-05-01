# Authentication

MINT supports two complementary authentication methods: a classic email + password flow that issues short-lived JWTs, and WebAuthn / passkey login that uses a hardware security key, Touch ID, Windows Hello, or any other passkey-capable authenticator.

> [Screenshot: login page showing email-and-password form and "Sign in with passkey" button]

## At a glance

| Method | What you remember | Server stores | Cross-device |
|--------|-------------------|---------------|--------------|
| **Password + JWT** | A password | A salted password hash + your JWT secret | Yes |
| **Passkey (WebAuthn)** | Nothing — your device authenticates you | A public key only | Per-device unless you sync via iCloud Keychain / Google Password Manager |

Both methods can be enabled at the same time — users can register a passkey on top of their password account and choose either at login.

## Sign in with email + password

Standard form on the login page. On success, MINT issues a JWT with a 24-hour expiry, stored in an HttpOnly cookie. JWTs are refreshed automatically on each authenticated request.

| Setting | Default | Where |
|---------|---------|-------|
| Token TTL | 24 hours | `auth.jwtTtlHours` in `config.json` |
| JWT secret | Required | `auth.jwtSecret` (32+ random bytes; never commit it) |
| Password hashing | bcrypt, cost 12 | Implementation detail of `auth_service` |

::: warning Rotate the JWT secret carefully
Rotating `auth.jwtSecret` invalidates every active session, signing every user out. Plan rotations during a maintenance window.
:::

## Sign in with a passkey

If passkeys are enabled (`auth.passkeysEnabled: true`), users can register one or more authenticators on **Settings → Security**.

> [Screenshot: Settings → Security panel listing registered passkeys with last-used timestamps]

Each registered passkey carries:

- A friendly name (e.g., "Work laptop", "YubiKey 5")
- The credential ID
- A public key
- A last-used timestamp
- The user agent it was registered from

To log in with a passkey, click **Sign in with passkey** on the login page; your browser walks you through device unlock and the server verifies the signature. No password is involved.

## Recovery and lockout

| Scenario | Resolution |
|----------|------------|
| Lost passkey, no password set | The admin can issue a one-time recovery email from **Admin → Users** that lets you set a new password and register a fresh passkey. |
| Forgotten password | Standard "forgot password" flow; requires SMTP configured. |
| All authenticators lost | Admin must manually reset, with the same out-of-band identity check the lab uses for any sensitive operation. |
| Account compromised | Admin disables the user (revokes JWT, marks credentials inactive), then re-enables after a fresh password and passkey registration. |

## Single sign-on (SSO)

If your lab uses an external identity provider (Microsoft Entra, Google Workspace, Okta, …), MINT can delegate authentication via OIDC. Enable it in `config.json`:

```json
{
  "auth": {
    "sso": {
      "provider": "oidc",
      "issuer": "https://login.example.org/",
      "clientId": "...",
      "clientSecret": "..."
    }
  }
}
```

When SSO is configured, the login page redirects to the IdP. Local password and passkey logins remain available for break-glass admin accounts unless you also set `auth.localLoginEnabled: false`.

## Rate limiting

Auth routes are rate-limited to **20 requests per 60 seconds per IP** (`middleware/rate_limit.py`). The limit is skipped automatically in `devMode`. If you're running behind a proxy that doesn't forward `X-Forwarded-For`, every request appears to come from the proxy and the limit fires for the whole lab — fix by configuring the proxy to forward client IPs.

## Audit and observability

Every successful and failed auth attempt emits a structured log line plus an OpenTelemetry span. Failed attempts include the username and IP; successful attempts include the user ID and the auth method (password / passkey / SSO). Logs are not persisted by MINT itself — ship them to the lab's existing log store.

## Next

→ [Members & roles](/workflow/members-roles) — what an authenticated user can do
→ [Permissions](/reference/permissions) — full RBAC reference
