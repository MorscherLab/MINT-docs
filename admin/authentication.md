# Authentication

MINT supports three sign-in methods: username or email plus password, WebAuthn passkeys (a security key, Touch ID, Windows Hello, or another passkey-capable authenticator), and optional SWITCH edu-ID single sign-on. By default a password or edu-ID sign-in must be followed by a second step: a passkey, or a code from an authenticator app (TOTP). See [Second factor](#second-factor).

> [Screenshot: login page showing the password form, the "SWITCH edu-ID" button, and "Continue with Passkey"]

## At a glance

| Method | What you remember | Server stores | Cross-device |
|--------|-------------------|---------------|--------------|
| **Password** | A password | A bcrypt password hash | Yes |
| **Passkey (WebAuthn)** | Nothing - your device authenticates you | A public key only | Per-device unless you sync via iCloud Keychain / Google Password Manager |
| **SWITCH edu-ID** | Your institutional edu-ID login | A linked external identity and normal MINT user record | Yes |
| **Authenticator app (TOTP)** | Nothing - the app shows a 6-digit code. Second step only, never a sign-in alone | An encrypted secret | Yes, if the app syncs |

All methods can be enabled at the same time. Users sign in with a password or edu-ID, confirm with a second factor (or set one up on first sign-in), and can then sign in with the passkey alone.

## Accounts and registration

Accounts come from two places:

- **Self-registration.** When `auth.allowRegistration` is `true` (the default), the login page shows **No account yet? Create one**, which opens `/register`. New accounts get the default role, Member, and stay inactive until an administrator activates them.
- **Admin creation.** An admin creates accounts with `mint platform admin user create <username> --role <slug>` (see [CLI](/admin/cli)).

Anyone who can reach the login page can register while self-registration is on. To turn it off, switch off **Admin -> System -> Configuration -> Authentication -> Registration** (needs `platform.configure`), or set `auth.allowRegistration` to `false` in `config.json` (or `MINT_AUTH__ALLOW_REGISTRATION=false`), then restart. The `/register` page then sends visitors to `/login`, and the registration API returns 403.

Every password (registration, profile change, admin create or reset) must be at least 8 characters and at most 72 bytes when UTF-8 encoded. A longer new password gets 422 `validation.request`. Sign-in still accepts a longer password and checks its first 72 bytes, so older accounts keep working.

## Sign in with a password

Enter a username or email and the password on the login page, then click **Sign in with password**. On success, MINT issues a bearer token and sets an HttpOnly `mint_access_token` cookie that plugin frontends use. The frontend refreshes the token through `/api/auth/refresh`.

| Setting | Default | Where |
|---------|---------|-------|
| Token lifetime | 10,080 minutes (7 days) | `auth.tokenExpireMinutes` |
| JWT secret | Generated on first start and saved to `config.json` when omitted | `auth.jwtSecretKey` (never commit it) |
| Lockout after failed logins | 5 attempts | `auth.failedLoginLimit` |
| Lockout length | 15 minutes | `auth.loginLockoutMinutes` |

A locked account gets "Too many failed login attempts. Try again later." until the lockout ends. A password change on `PUT /api/users/me` checks the current password under the same lockout: a wrong current password counts as a failed sign-in, is recorded as `auth.password_check_failure`, and a locked account gets 423 with `Retry-After`. When the current password is wrong or missing, the request changes nothing, also when it holds profile fields.

Login cookies carry `Secure` when `server.externalUrl` starts with `https://`. If `externalUrl` is unset, MINT uses the scheme of the incoming request, so behind a TLS proxy set `externalUrl`.

Changing a password revokes every session token issued for that account before the change. A user who changes their own password stays signed in in the current browser; every other session must sign in again. An admin password reset ends every session of the user, also a session that a token refresh or a second-factor sign-in made during the reset. Personal access tokens are not affected; see [Personal access tokens](#personal-access-tokens). An open admin terminal re-checks its session every 15 seconds and closes with "access revoked" once the session is revoked; see [Admin terminal](/reference/permissions#admin-terminal).

::: warning Rotate the JWT secret carefully
Rotating `auth.jwtSecretKey` invalidates every active session, signing every user out.
:::

## Sign in with a passkey

If passkeys are enabled (`auth.enablePasskey`, default `true`), users register one or more authenticators from **Your account -> Security** after signing in.

> [Screenshot: Your account -> Security listing registered passkeys with device names and creation dates]

To sign in, click **Continue with Passkey** on the login page. The button appears once at least one passkey is registered on the server and the browser supports WebAuthn. Deactivated accounts cannot sign in with a passkey.

The passkey relying-party ID and origin come from:

1. `server.rpId`, when set (origin `https://<rpId>`); or
2. the request host. MINT uses `X-Forwarded-Host` only when the request comes from a proxy in `server.trustedProxyCidrs`, and keeps a port other than 443 in the origin.

Set `server.rpId` to your public host name in production. A passkey is bound to its relying-party ID, so changing the host name later makes existing passkeys unusable.

## Second factor

`auth.requireSecondFactor` (default `true`, env `MINT_AUTH__REQUIRE_SECOND_FACTOR`, **Admin -> System -> Configuration -> Authentication -> Second factor**) adds a second step after a password or edu-ID sign-in. The step is a passkey or, when you enable it, a code from an authenticator app. A direct **Continue with Passkey** sign-in already proves two factors and stays one step.

MINT enforces the second factor only when all of these are true:

- `auth.enableAuth` is on and dev mode is off.
- `auth.requireSecondFactor` is on.
- The site offers at least one method:
  - **Passkey**: `auth.enablePasskey` is on **and** `server.externalUrl` starts with `https://`. `server.rpId` alone does not count. Behind a TLS proxy, set an HTTPS `server.externalUrl`.
  - **Authenticator app**: `auth.enableTotp` is on. It needs no HTTPS, so it enforces the second factor on a plain-HTTP site.

A site that does not meet these conditions stays single-factor. MINT logs one warning at startup that names the unmet conditions, and the admin panel shows a warning. An upgrade locks nobody out.

When the second factor is enforced:

- After the password or edu-ID step, an account that holds a method confirms with it. An account without one must set one up before it can continue; there is no skip. If the site offers both methods, the user chooses. Until then, the session token lasts 10 minutes and MINT sets no session cookie.
- Sessions issued before the upgrade do the second step once, without retyping the password.
- A password-only session is refused with 401 `auth.second_factor_required` on every route, including plugin routes, plugin frontends and the admin terminal.
- A user cannot remove their last second factor (409). "Delete all passkeys" is refused too.
- The password and edu-ID sign-in answers carry a `second_factor` step (`verify` or `enrol`) and `second_factor_methods`. The 401 `auth.second_factor_required` error names the same step in `details.second_factor` and the methods in `details.methods`.
- Personal access tokens, service tokens and `/mcp` are unchanged. Scripts, CI and the Python `MINTClient` must use a personal access token: `MINTClient.login(username, password)` raises `auth.second_factor_required`. The `mint` CLI signs in with a device code approved in the browser; see [CLI](/admin/cli#authenticate).

### Authenticator app (TOTP)

An authenticator app is off by default. To turn it on, switch on **Admin -> System -> Configuration -> Authentication -> Authenticator app**, or set `auth.enableTotp` to `true` (env `MINT_AUTH__ENABLE_TOTP=true`), then restart. The login page shows the code step only after you turn it on. The public config reports it as `totp_enabled`.

Turning it on also enforces the second factor on a plain-HTTP site. Every user then needs a second factor before the next sign-in completes. On a plain-HTTP site, the authenticator app is the only method. Tell your users first.

| Property | Behavior |
|----------|----------|
| Standard | RFC 6238: SHA-1, 6 digits, 30-second steps. MINT accepts the current step and one step on each side |
| Storage | One authenticator app for each user. MINT stores the secret encrypted (`enc:v1`) with the platform secret key (`MINT_SECRETS__ENCRYPTION_KEY`), not with the JWT secret |
| Replay | A code works once. A reused code gets 401 |
| Lockout | A wrong or reused code counts as a failed sign-in and can lock the account (423). While the second factor is enforced, only a completed sign-in resets the count, not the password alone |
| Recovery codes | None. A user who loses the app asks an admin for a [reset](#recovery) |
| Audit | `totp.enrol`, `totp.delete`, and `auth.login_failure` for a refused code. The sign-in is recorded as `auth.login_success` with the method `totp` |

The user flow:

1. **Set up.** After the password step, the login page shows **Set up an authenticator app**. The user scans the QR code (drawn in the browser) or types the key, then enters the first 6-digit code. MINT marks the app as set up after the first correct code. A user who is already signed in can also set it up in **Your account -> Security**.
2. **Sign in.** After the password step, the login page asks for the code. If the account holds both a passkey and an authenticator app, it offers both.
3. **Remove.** The user removes the app in **Your account -> Security**. MINT refuses this (409) while it is the user's last second factor and the second factor is enforced.

A user who is signed in with only a password session can add a first second factor of either kind, and no more than that. A user with a second factor adds another one only from a full session.

The API routes are `POST /api/auth/totp/enrol/start`, `POST /api/auth/totp/enrol/confirm`, `POST /api/auth/totp/verify`, and `GET` and `DELETE /api/users/me/totp`. A personal access token cannot call them.

## Recovery

| Scenario | Resolution |
|----------|------------|
| Lost passkey, password still known | Without an enforced second factor, sign in with the password, then remove the old credential and register a new passkey from **Your account -> Security**. With it, ask an admin to choose **Reset passkeys** for your account (next row). |
| Lost every passkey, or the authenticator app | An admin opens **Admin -> People & access -> Users** and chooses **Reset passkeys** for the user. This removes all of the user's passkeys **and the authenticator app** and ends their sessions; at the next sign-in they set up a new second factor. It needs `users.manage`, cannot be used on your own account, and is recorded as `passkey.admin_reset` (with `changes.passkeys` and `changes.totp`). |
| Forgotten password | An admin resets it from **Admin -> People & access -> Users**. There is no self-service email reset. |
| Password and every second factor lost | After the lab's normal identity check, an admin resets the password and the second factors; the user signs in and sets up a new one. |
| Last administrator lost their second factor | Set `MINT_AUTH__REQUIRE_SECOND_FACTOR=false`, restart, sign in with the password, replace the passkey or authenticator app in **Your account -> Security**, then unset the variable and restart. |
| Account compromised | An admin deactivates or deletes the user from **Admin -> People & access -> Users**, then restores access after a password reset and passkey review. |

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
| Lifetime | 30, 90 or 365 days (default 90), capped by `auth.patMaxLifetimeDays` (default 365). Set the cap under **Admin -> System -> Configuration -> Authentication -> Access token lifetime** |
| Scope | Acts with the owner's role. A read-only token is refused with 403 for any request other than a read (`GET`, `HEAD`, `OPTIONS`), and MCP write tools are hidden from it |
| Accepted by | Every REST route as `Authorization: Bearer`, the plugin proxy, and `/mcp`. The plugin proxy removes the token before it forwards a request, so a plugin in its own process never sees it. A plugin that runs in the platform process still receives the `Authorization` header of the request |
| Limits | A personal access token cannot issue personal access tokens or change sign-in methods (passkey enrol or delete, password set): those routes answer 403 |
| Ends | On revocation, on expiry, or when the account is deactivated. A password change does **not** revoke tokens |

**Admin -> People & access -> Access tokens** (needs `users.manage`) lists every user's unrevoked tokens and revokes any of them. The API equivalents are `GET /api/admin/tokens` and `DELETE /api/admin/tokens/{id}`. Creating and revoking tokens is recorded in the audit log as `api_token.create` and `api_token.revoke`.

> [Screenshot: Admin -> People & access -> Access tokens listing tokens of several users with a Revoke action]

When an account is compromised, deactivate it: sessions and tokens of an inactive account are refused. Revoke its tokens before reactivating it.

## Service tokens

A service token is a credential for an instrument daemon that reports to a plugin. A daemon cannot use a person's session or personal access token for this job. Plugin authors: see [Instrument status](/sdk/recipes/instrument-status).

Create a service token in **Admin -> People & access -> Service tokens**. The section needs both `users.manage` and `instruments.edit`. Click **New token** and set:

| Field | Meaning |
|-------|---------|
| **Name** | A label for the token |
| **Plugin** | The one plugin the token belongs to. The list shows only plugins that declare the `instrument_status` feature (wire flag `instrument_status_write`) |
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

An uninstall of the plugin revokes its tokens (`service_token.revoke`, system actor). A token that you issue after you reinstall the plugin stays valid. The 1.4 upgrade does not revoke the tokens of plugins that you uninstalled before; revoke them here.

The API equivalents are `GET` and `POST /api/admin/service-tokens` and `DELETE /api/admin/service-tokens/{id}`. A personal access token cannot create a service token; sign in as a user.

The **Instruments** list shows only the instruments granted to the selected plugin. Grant them in the **Instrument status** block of the plugin's access settings (**Admin -> Plugins -> Installed -> plugin actions -> Access control**). Setting that grant needs `instruments.edit`.

## Device-code sign-in for the `mint` CLI

`mint platform auth login` uses the OAuth device authorization grant (RFC 8628). The CLI asks `POST /oauth/device_authorization`, shows a short code and the address `<server.externalUrl>/device`, and polls `POST /oauth/token`. The user opens `/device` in a browser where they are signed in (a phone works), types the code, chooses the token lifetime (and read-only if wanted) and approves. The poll then returns a [personal access token](#personal-access-tokens). `/.well-known/oauth-authorization-server` publishes the endpoints. A code is valid for 10 minutes. Pending codes live in memory, so a restart cancels them. Password sign-in from the CLI does not exist. With the second factor on, the browser step needs a full session.

## Disabling authentication

`auth.enableAuth: false` or `devMode: true` turns sign-in off, and every visitor becomes an implicit administrator. Only administrators can change either setting through **Admin -> System -> Configuration**; `platform.configure` alone is not enough. Never run a reachable server this way.

## Rate limiting

These paths are limited to **20 requests per 60 seconds per client IP**: `/api/auth` (including passkey routes), `/api/setup`, `/api/users/register`, and `PUT /api/users/me`. `/mcp` has its own bucket of 240 requests per 60 seconds, and `/oauth` has one of 60. MINT does not rate-limit in dev mode. The public bootstrap reads `GET /api/auth/config` and `GET /api/setup/config/public` are exempt. The session checks are also exempt, because they present an existing session and take no credential to guess: `GET /api/auth/verify`, `POST /api/auth/refresh`, `POST /api/auth/logout` and `GET /api/auth/passkey/credentials`. The sign-in, second-factor, registration and device-code routes keep the limit. Over the limit, MINT answers 429.

When a session check fails with a status other than 401 (for example 429 or 503), the browser keeps the session and uses the user of the last successful check. When a session expires or is revoked, a protected page goes to the sign-in page and returns to the page after the sign-in.

MINT takes the client IP from `X-Forwarded-For` only when the request comes from a proxy in `server.trustedProxyCidrs` (default: loopback). An explicitly empty list trusts no proxy. See [Reverse proxy](/admin/reverse-proxy#trusted-proxies).

## Audit log

MINT records security-relevant events in the database, including `auth.login_success` and `auth.login_failure` for password and passkey logins, `user.register`, `user.create`, `auth.password_check_failure`, `api_token.create` and `api_token.revoke`, `service_token.create` and `service_token.revoke`, `passkey.admin_reset`, `totp.enrol` and `totp.delete`, MCP write calls (`mcp.tool_call`), and project, experiment, and plugin changes. Read them through the API; there is no audit page in the UI. See [Audit log](/admin/platform-settings#logs-and-audit-log).

For tracing, MINT can export OpenTelemetry spans for FastAPI, SQLAlchemy, and logging when `observability.enabled` is `true`.

## Next

→ [Users & roles](/admin/users-roles) — what an authenticated user can do
→ [Permissions](/reference/permissions) — full RBAC reference
