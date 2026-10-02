# Authentication

MINT supports three sign-in methods: username or email plus password, WebAuthn passkeys (a security key, Touch ID, Windows Hello, or another passkey-capable authenticator), and optional SWITCH edu-ID single sign-on. By default a password or edu-ID sign-in must be followed by a passkey step; see [Second factor](#second-factor).

> [Screenshot: login page showing the password form, the "SWITCH edu-ID" button, and "Continue with Passkey"]

## At a glance

| Method | What you remember | Server stores | Cross-device |
|--------|-------------------|---------------|--------------|
| **Password** | A password | A bcrypt password hash | Yes |
| **Passkey (WebAuthn)** | Nothing - your device authenticates you | A public key only | Per-device unless you sync via iCloud Keychain / Google Password Manager |
| **SWITCH edu-ID** | Your institutional edu-ID login | A linked external identity and normal MINT user record | Yes |

All methods can be enabled at the same time. Users sign in with a password or edu-ID, confirm with a passkey (or register one on first sign-in), and can then sign in with the passkey alone.

## Accounts and registration

Accounts come from two places:

- **Self-registration.** When `auth.allowRegistration` is `true` (the default), the login page shows **No account yet? Create one**, which opens `/register`. New accounts get the default role, Member.
- **Admin creation.** An admin creates accounts with `mint admin user create <username> --role <slug>` (see [CLI](/admin/cli)).

Anyone who can reach the login page can register while self-registration is on. To turn it off, switch off **Admin -> Platform -> Configuration -> Authentication -> Registration** (needs `platform.configure`), or set `auth.allowRegistration` to `false` in `config.json` (or `MINT_AUTH__ALLOW_REGISTRATION=false`), then restart. The `/register` page then sends visitors to `/login`, and the registration API returns 403.

Every password (registration, profile change, admin create or reset) must be at least 8 characters and at most 72 bytes when UTF-8 encoded. A longer new password gets 422 `validation.request`. Sign-in still accepts a longer password and checks its first 72 bytes, so older accounts keep working.

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

Changing a password, by the user or through an admin reset, revokes every session token issued for that account before the change. A user who changes their own password stays signed in in the current browser; every other session must sign in again. Personal access tokens are not affected; see [Personal access tokens](#personal-access-tokens). An open admin terminal re-checks its session every 15 seconds and closes with "access revoked" once the session is revoked; see [Admin terminal](/reference/permissions#admin-terminal).

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

## Second factor

`auth.requireSecondFactor` (default `true`, env `MINT_AUTH__REQUIRE_SECOND_FACTOR`, **Admin -> Platform -> Configuration -> Authentication -> Second factor**) makes a passkey the second step after a password or edu-ID sign-in. A direct **Continue with Passkey** sign-in already proves two factors and stays one step.

It is enforced only when authentication and passkeys are enabled, dev mode is off, **and `server.externalUrl` starts with `https://`**; `server.rpId` alone does not count. A site that does not meet this stays single-factor and shows a warning at startup and in the admin panel, so an upgrade locks nobody out. Behind a TLS proxy, set an HTTPS `server.externalUrl` or the second factor stays off.

When enforced:

- After the password or edu-ID step, an account with a passkey confirms with it. An account without one must enrol one before it can continue; there is no skip.
- Sessions issued before the upgrade do the passkey step once, without retyping the password.
- A password-only session is refused with 401 `auth.second_factor_required` on every route, including plugin routes, plugin frontends and the admin terminal.
- A user cannot delete their last passkey.
- Personal access tokens, service tokens and `/mcp` are unchanged. Scripts, CI and the Python `MINTClient` must use a personal access token: `MINTClient.login(username, password)` raises `auth.second_factor_required`. The `mint` CLI signs in with a device code approved in the browser; see [CLI](/admin/cli#authenticate).

## Recovery

| Scenario | Resolution |
|----------|------------|
| Lost passkey, password still known | Without an enforced second factor, sign in with the password, then remove the old credential and register a new passkey from **Your account -> Security**. With it, ask an admin to choose **Reset passkeys** for your account (next row). |
| Lost every passkey | An admin opens **Admin -> People -> Users** and chooses **Reset passkeys** for the user. This removes all of the user's passkeys and ends their sessions; at the next sign-in they enrol a new one. It needs `users.manage`, cannot be used on your own account, and is recorded as `passkey.admin_reset`. |
| Forgotten password | An admin resets it from **Admin -> People -> Users**. There is no self-service email reset. |
| Password and every passkey lost | After the lab's normal identity check, an admin resets the password and the passkeys; the user signs in and enrols a fresh passkey. |
| Last administrator lost their passkey | Set `MINT_AUTH__REQUIRE_SECOND_FACTOR=false`, restart, sign in with the password, replace the passkey in **Your account -> Security**, then unset the variable and restart. |
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

## Personal access tokens

Users create personal access tokens for scripts, the `mint` CLI (`MINT_TOKEN`) and AI assistants connected over MCP. How users create and use them is described in [AI assistants and API access](/guide/ai-and-api).

For administrators:

| Property | Behavior |
|----------|----------|
| Format | Starts with `mint_pat_`; the secret is shown once at creation. MINT stores only a digest |
| Lifetime | 30, 90 or 365 days (default 90), capped by `auth.patMaxLifetimeDays` (default 365). Set the cap under **Admin -> Platform -> Configuration -> Authentication -> Access token lifetime** |
| Scope | Acts with the owner's role. A read-only token is refused with 403 for any request other than a read (`GET`, `HEAD`, `OPTIONS`), and MCP write tools are hidden from it |
| Accepted by | Every REST route as `Authorization: Bearer`, the plugin proxy, and `/mcp`. The plugin proxy does not forward the token to plugins |
| Ends | On revocation, on expiry, or when the account is deactivated. A password change does **not** revoke tokens |

**Admin -> Platform -> Access Tokens** (needs `users.manage`) lists every user's unrevoked tokens and revokes any of them. The API equivalents are `GET /api/admin/tokens` and `DELETE /api/admin/tokens/{id}`. Creating and revoking tokens is recorded in the audit log as `api_token.create` and `api_token.revoke`.

> [Screenshot: Admin -> Platform -> Access Tokens listing tokens of several users with a Revoke action]

When an account is compromised, deactivate it: sessions and tokens of an inactive account are refused. Revoke its tokens before reactivating it.

## Service tokens

A service token is a credential for an instrument daemon that reports to a plugin. A daemon cannot use a person's session or personal access token for this job. Plugin authors: see [Instrument status](/sdk/recipes/instrument-status).

Create a service token in **Admin -> Platform -> Service Tokens**. The section needs both `users.manage` and `instruments.edit`. Click **New token** and set:

| Field | Meaning |
|-------|---------|
| **Name** | A label for the token |
| **Plugin** | The one plugin the token belongs to. The list shows only plugins that declare `instrument_status_write` |
| **Instruments** | A subset of the instruments granted to that plugin. At least one |
| **Expires** | 90 days, 365 days or Never (default) |

MINT shows the secret once. Copy it before you close the dialog.

| Property | Behavior |
|----------|----------|
| Format | Starts with `mint_svc_`. MINT stores only a digest |
| Reach | Only the routes of its own plugin. The plugin must still declare the capability, and the token must name an instrument that the plugin's grant still holds; otherwise the request gets 403 `plugin.service_token_scope`. REST `/api` routes and `/mcp` do not accept service tokens |
| Plugin sees | MINT removes the token from the request and adds `X-MINT-Service-Token-Id` and `X-MINT-Instrument-Ids` |
| Ends | On revocation or expiry. Click **Revoke**, then **Confirm**, in the token table |
| Audit | `service_token.create` and `service_token.revoke` |

The API equivalents are `GET` and `POST /api/admin/service-tokens` and `DELETE /api/admin/service-tokens/{id}`. A personal access token cannot create a service token; sign in as a user.

The **Instruments** list shows only the instruments granted to the selected plugin. Grant them in the **Instrument status** block of the plugin's access settings (**Admin -> Plugins -> Installed -> plugin actions -> Access control**). Setting that grant needs `instruments.edit`.

## Disabling authentication

`auth.enableAuth: false` or `devMode: true` turns sign-in off, and every visitor becomes an implicit administrator. Only administrators can change either setting through **Admin -> Platform -> Configuration**; `platform.configure` alone is not enough. Never run a reachable server this way.

## Rate limiting

These paths are limited to **20 requests per 60 seconds per client IP**: `/api/auth` (including passkey routes), `/api/setup`, and `/api/users/register`. The public bootstrap reads `GET /api/auth/config` and `GET /api/setup/config/public` are exempt. Over the limit, MINT answers 429.

MINT takes the client IP from `X-Forwarded-For` only when the request comes from a proxy in `server.trustedProxyCidrs` (default: loopback). An explicitly empty list trusts no proxy. See [Reverse proxy](/admin/proxy-and-setup#reverse-proxy).

## Audit log

MINT records security-relevant events in the database, including `auth.login_success` and `auth.login_failure` for password and passkey logins, `user.register`, `api_token.create` and `api_token.revoke`, `service_token.create` and `service_token.revoke`, `passkey.admin_reset`, MCP write calls (`mcp.tool_call`), and project, experiment, and plugin changes. Read them through the API; there is no audit page in the UI yet. See [Audit log](/admin/platform-settings#logs-and-audit-log).

For tracing, MINT can export OpenTelemetry spans for FastAPI, SQLAlchemy, and logging when `observability.enabled` is `true`.

## Next

→ [Users & roles](/admin/users-roles) — what an authenticated user can do
→ [Permissions](/reference/permissions) — full RBAC reference
