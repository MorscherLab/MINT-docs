# Authentication

MINT supports three sign-in methods: username or email plus password, WebAuthn passkeys (a security key, Touch ID, Windows Hello, or another passkey-capable authenticator), and optional SWITCH edu-ID single sign-on. A passkey is an alternative way to sign in, not a second factor.

> [Screenshot: login page showing the password form, the "SWITCH edu-ID" button, and "Continue with Passkey"]

## At a glance

| Method | What you remember | Server stores | Cross-device |
|--------|-------------------|---------------|--------------|
| **Password** | A password | A bcrypt password hash | Yes |
| **Passkey (WebAuthn)** | Nothing - your device authenticates you | A public key only | Per-device unless you sync via iCloud Keychain / Google Password Manager |
| **SWITCH edu-ID** | Your institutional edu-ID login | A linked external identity and normal MINT user record | Yes |

All methods can be enabled at the same time. Users sign in with a password, register a passkey from their profile, link an edu-ID account, and then choose the available method on the login page.

## Accounts and registration

Accounts come from two places:

- **Self-registration.** When `auth.allowRegistration` is `true` (the default), the login page shows **No account yet? Create one**, which opens `/register`. New accounts get the default role, Member.
- **Admin creation.** An admin creates accounts with `mint admin user create <username> --role <slug>` (see [CLI](/admin/cli)).

Anyone who can reach the login page can register while self-registration is on. To turn it off, set `auth.allowRegistration` to `false` in `config.json` (or `MINT_AUTH__ALLOW_REGISTRATION=false`) and restart. The `/register` page then sends visitors to `/login`, and the registration API returns 403.

Every password (registration, profile change, admin create or reset) must be at least 8 characters.

## Sign in with a password

Enter a username or email and the password on the login page, then click **Sign in with password**. On success, MINT issues a bearer token and sets an HttpOnly `mint_access_token` cookie that plugin frontends use. The frontend refreshes the token through `/api/auth/refresh`.

| Setting | Default | Where |
|---------|---------|-------|
| Token lifetime | 10,080 minutes (7 days) | `auth.tokenExpireMinutes` |
| JWT secret | Generated on first start and saved to `config.json` when omitted | `auth.jwtSecretKey` (never commit it) |
| Lockout after failed logins | 5 attempts | `auth.failedLoginLimit` |
| Lockout length | 15 minutes | `auth.loginLockoutMinutes` |

A locked account gets "Too many failed login attempts. Try again later." until the lockout ends.

Login cookies carry `Secure` when `server.externalUrl` starts with `https://`. If `externalUrl` is unset, MINT uses the scheme of the incoming request, so behind a TLS proxy set `externalUrl`.

::: warning Rotate the JWT secret carefully
Rotating `auth.jwtSecretKey` invalidates every active session, signing every user out.:::

## Sign in with a passkey

If passkeys are enabled (`auth.enablePasskey`, default `true`), users register one or more authenticators from **Your account -> Security** after signing in.

> [Screenshot: Your account -> Security listing registered passkeys with device names and creation dates]

To sign in, click **Continue with Passkey** on the login page. The button appears once at least one passkey is registered on the server and the browser supports WebAuthn. Deactivated accounts cannot sign in with a passkey.

The passkey relying-party ID and origin come from:

1. `server.rpId`, when set (origin `https://<rpId>`); or
2. the request host. MINT uses `X-Forwarded-Host` only when the request comes from a proxy in `server.trustedProxyCidrs`, and keeps a port other than 443 in the origin.

Set `server.rpId` to your public host name in production. A passkey is bound to its relying-party ID, so changing the host name later makes existing passkeys unusable.

## Recovery

| Scenario | Resolution |
|----------|------------|
| Lost passkey, password still known | Sign in with the password, then remove the old credential and register a new passkey from **Your account -> Security**. |
| Forgotten password | An admin resets it from **Admin -> People -> Users**. There is no self-service email reset. |
| All authenticators lost | Ask an admin to reset the password after the lab's normal identity check, then register a fresh passkey. |
| Account compromised | An admin deactivates or deletes the user from **Admin -> People -> Users**, then restores access after a password reset and passkey review. |

Resetting passwords and deactivating users needs `users.manage`, and only for users whose role does not outrank yours (see [Users & roles](/admin/users-roles#who-can-manage-whom)).

## SWITCH edu-ID SSO

When `sso.eduid.enabled` is `true`, the login page shows a **SWITCH edu-ID** button. MINT starts an OpenID Connect flow at `/api/auth/sso/eduid/login`, handles the callback at `/api/auth/sso/eduid/callback`, and completes the browser handoff through `/api/auth/sso/eduid/complete`.

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

- `server.externalUrl` must be the public HTTPS URL so MINT can build the callback URL.
- `openid` must remain in `sso.eduid.scopes`.
- Keep at least one local admin account with a password as break-glass access in case the external provider is unavailable.

If `autoProvision` is enabled (default), a first edu-ID login creates the MINT user automatically. The stable edu-ID claim defaults to `swissEduIDUniqueID`; the local username defaults to the `email` claim.

## Disabling authentication

`auth.enableAuth: false` or `devMode: true` turns sign-in off, and every visitor becomes an implicit administrator. Only administrators can change either setting through **Admin -> Platform -> Configuration**; `platform.configure` alone is not enough. Never run a reachable server this way.

## Rate limiting

These paths are limited to **20 requests per 60 seconds per client IP**: `/api/auth` (including passkey routes), `/api/setup`, and `/api/users/register`. The public bootstrap reads `GET /api/auth/config` and `GET /api/setup/config/public` are exempt. Over the limit, MINT answers 429.

MINT takes the client IP from `X-Forwarded-For` only when the request comes from a proxy in `server.trustedProxyCidrs` (default: loopback). An explicitly empty list trusts no proxy. See [Reverse proxy](/admin/proxy-and-setup#reverse-proxy).

## Audit log

MINT records security-relevant events in the database, including `auth.login_success` and `auth.login_failure` for password and passkey logins, `user.register`, and project, experiment, and plugin changes. Read them through the API; there is no audit page in the UI yet. See [Audit log](/admin/platform-settings#logs-and-audit-log).

For tracing, MINT can export OpenTelemetry spans for FastAPI, SQLAlchemy, and logging when `observability.enabled` is `true`.

## Next

→ [Users & roles](/admin/users-roles) — what an authenticated user can do
→ [Permissions](/reference/permissions) — full RBAC reference
