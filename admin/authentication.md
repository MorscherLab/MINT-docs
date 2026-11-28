# Authentication

This page tells administrators how to configure sign-in, the second factor, tokens and account recovery. Users sign in as described in [Sign in](/guide/access#sign-in).

MINT has three sign-in methods: a username or email with a password, a WebAuthn passkey, and SWITCH edu-ID single sign-on. By default, a password or edu-ID sign-in needs a [second factor](#second-factor): a passkey or a code from an authenticator app (TOTP).

> [Screenshot: login page with the password form, the SWITCH edu-ID button and the Continue with Passkey button]

| Method | The user remembers | The server stores | Cross-device |
|--------|--------------------|-------------------|--------------|
| Password | A password | A bcrypt hash | Yes |
| Passkey (WebAuthn) | Nothing | A public key | Per device, unless iCloud Keychain or Google Password Manager syncs it |
| SWITCH edu-ID | The institutional edu-ID login | A linked external identity and a MINT user record | Yes |
| Authenticator app (TOTP) | Nothing. Second step only, never a sign-in alone | An encrypted secret | Yes, if the app syncs |

You can enable all methods at the same time. A user signs in with a password or edu-ID and confirms with a second factor. After that, the user can sign in with the passkey alone.

## Accounts and registration

Accounts come from two sources:

- **Self-registration.** When `auth.allowRegistration` is `true` (the default), the login page shows **No account yet? Create one**. This opens `/register`. A new account gets the default role, Member. It stays inactive until an administrator activates it in **Admin -> People & access -> Users**.
- **Admin creation.** Run `mint platform admin user create <username> --role <slug>` (see [mint CLI](/admin/cli#admin)).

While self-registration is on, anyone who can open the login page can register. To turn it off, do one of these steps, then restart:

- Switch off **Admin -> System -> Configuration -> Authentication -> Registration** (needs `platform.configure`).
- Set `auth.allowRegistration` to `false` in `config.json`, or set `MINT_AUTH__ALLOW_REGISTRATION=false`.

The `/register` page then sends visitors to `/login`, and the registration API returns 403.

Every new password (registration, profile change, admin create or reset) must have at least 8 characters and at most 72 bytes in UTF-8. A longer new password gets 422 `validation.request`. Sign-in still accepts a longer password and checks its first 72 bytes, so older accounts keep working.

## Sign in with a password

The user enters a username or email and the password, then clicks **Sign in with password**. MINT issues a bearer token and sets the HttpOnly `mint_access_token` cookie, which plugin frontends use. The frontend refreshes the token through `/api/auth/refresh`.

| Setting | Default | Key |
|---------|---------|-----|
| Token lifetime | 10,080 minutes (7 days) | `auth.tokenExpireMinutes` |
| JWT secret | Generated on first start and saved to `config.json` when empty | `auth.jwtSecretKey`. Never commit it |
| Failed logins before lockout | 5 | `auth.failedLoginLimit` |
| Lockout length | 15 minutes | `auth.loginLockoutMinutes` |

A locked account gets "Too many failed login attempts. Try again later." until the lockout ends.

A password change on `PUT /api/users/me` checks the current password under the same lockout. A wrong current password counts as a failed sign-in and is recorded as `auth.password_check_failure`. A locked account gets 423 with `Retry-After`. When the current password is wrong or missing, the request changes nothing, also when it holds profile fields.

Behind a TLS proxy, set `server.externalUrl` so that login cookies carry `Secure`. See [Reverse proxy -> Public URL](/admin/reverse-proxy#public-url).

A password change revokes every session token that MINT issued for the account before the change:

- A user who changes their own password stays signed in in the current browser. Every other session must sign in again.
- An admin password reset ends every session of the user. This includes a session that a token refresh or a second-factor sign-in made during the reset.
- Personal access tokens stay valid. See [Personal access tokens](#personal-access-tokens).
- An open admin terminal closes with "access revoked" within 15 seconds. See [Admin terminal](/reference/permissions#admin-terminal).

::: warning Rotate the JWT secret carefully
A new `auth.jwtSecretKey` makes every active session invalid. Every user is signed out.
:::

## Sign in with a passkey

Passkeys are on by default (`auth.enablePasskey`). A user registers one or more authenticators in **Your account -> Security** after sign-in.

> [Screenshot: Your account -> Security with two registered passkeys, each with a device name and a creation date]

The login page shows **Continue with Passkey** when the server has at least one passkey and the browser supports WebAuthn. A deactivated account cannot sign in with a passkey.

MINT takes the passkey relying-party ID and origin from:

1. `server.rpId`, when it is set. The origin is then `https://<rpId>`.
2. Otherwise, the request host. MINT uses `X-Forwarded-Host` only from a proxy in `server.trustedProxyCidrs`. A port other than 443 stays in the origin.

Set `server.rpId` to your public host name in production. A passkey is bound to its relying-party ID. If you change the host name later, existing passkeys stop working.

## Second factor

`auth.requireSecondFactor` (default `true`, env `MINT_AUTH__REQUIRE_SECOND_FACTOR`) adds a second step after a password or edu-ID sign-in. Change it in **Admin -> System -> Configuration -> Authentication -> Second factor**. A direct **Continue with Passkey** sign-in already proves two factors and stays one step.

MINT enforces the second factor only when all of these conditions are true:

- `auth.enableAuth` is on and dev mode is off.
- `auth.requireSecondFactor` is on.
- The site offers at least one method:
  - Passkey: `auth.enablePasskey` is on and `server.externalUrl` starts with `https://`. `server.rpId` alone is not sufficient.
  - Authenticator app: `auth.enableTotp` is on. It needs no HTTPS.

If a condition is not true, the site stays single-factor. MINT logs one startup warning that names the conditions, and the admin panel shows a warning. An upgrade locks nobody out.

When MINT enforces the second factor:

- After the password or edu-ID step, an account with a method confirms with it. An account without a method must set one up. There is no skip. If the site offers both methods, the user chooses.
- Until the second step is complete, the session token lasts 10 minutes, and MINT sets no session cookie.
- A session from before the upgrade does the second step once, without the password.
- MINT refuses a password-only session with 401 `auth.second_factor_required` on every route. This includes plugin routes, plugin frontends and the admin terminal.
- A user cannot remove the last second factor (409). MINT also refuses "Delete all passkeys".
- The password and edu-ID sign-in responses carry `second_factor` (`verify` or `enrol`) and `second_factor_methods`. The 401 error has the same values in `details.second_factor` and `details.methods`.
- Personal access tokens, service tokens and `/mcp` do not change. Scripts, CI and the Python `MINTClient` must use a personal access token: `MINTClient.login(username, password)` raises `auth.second_factor_required`. The `mint` CLI signs in with a [device code](#device-code-sign-in-for-the-mint-cli).

### Authenticator app (TOTP)

The authenticator app is off by default. To turn it on, do one of these steps, then restart:

- Switch on **Admin -> System -> Configuration -> Authentication -> Authenticator app**.
- Set `auth.enableTotp` to `true` (env `MINT_AUTH__ENABLE_TOTP=true`).

The login page shows the code step only after you turn it on. The public config reports it as `totp_enabled`.

::: warning Tell your users first
On a plain-HTTP site, the authenticator app enforces the second factor and is the only method. Every user must then set up a second factor at the next sign-in.
:::

| Property | Behavior |
|----------|----------|
| Standard | RFC 6238: SHA-1, 6 digits, 30-second steps. MINT accepts the current step and one step on each side |
| Storage | One authenticator app for each user. MINT encrypts the secret (`enc:v1`) with the platform secret key (`MINT_SECRETS__ENCRYPTION_KEY`), not with the JWT secret |
| Replay | A code works once. A reused code gets 401 |
| Lockout | A wrong or reused code counts as a failed sign-in and can lock the account (423). While the second factor is enforced, only a completed sign-in resets the count |
| Recovery codes | None. A user who loses the app asks an admin for a [reset](#recovery) |
| Audit | `totp.enrol`, `totp.delete`, and `auth.login_failure` for a refused code. A sign-in is `auth.login_success` with the method `totp` |

The user flow:

1. **Set up.** After the password step, the login page shows **Set up an authenticator app**. The user scans the QR code or types the key, then enters the first code. A signed-in user can also set it up in **Your account -> Security**.
2. **Sign in.** After the password step, the login page asks for the code. If the account has a passkey and an authenticator app, the page offers both.
3. **Remove.** The user removes the app in **Your account -> Security**. MINT refuses this (409) while the app is the last second factor and the second factor is enforced.

A password-only session can add one first second factor of either kind. To add more, the user needs a full session.

The API routes are `POST /api/auth/totp/enrol/start`, `POST /api/auth/totp/enrol/confirm`, `POST /api/auth/totp/verify`, and `GET` and `DELETE /api/users/me/totp`. A personal access token cannot call them.

## Recovery

| Scenario | Resolution |
|----------|------------|
| Lost passkey, password still known | Without an enforced second factor: sign in with the password, then remove the old passkey and register a new one in **Your account -> Security**. With an enforced second factor: ask an admin for **Reset passkeys** (next row) |
| Lost every passkey, or lost the authenticator app | An admin opens **Admin -> People & access -> Users** and chooses **Reset passkeys** for the user. This removes all passkeys and the authenticator app, and ends the user's sessions. At the next sign-in, the user sets up a new second factor. It needs `users.manage` and does not work on your own account. The audit log records `passkey.admin_reset` with `changes.passkeys` and `changes.totp` |
| Forgotten password | An admin resets it in **Admin -> People & access -> Users**. There is no self-service email reset |
| Password and every second factor lost | Do the lab's identity check. Then an admin resets the password and the second factors |
| The last administrator lost the second factor | Set `MINT_AUTH__REQUIRE_SECOND_FACTOR=false` and restart. Sign in with the password and replace the passkey or authenticator app in **Your account -> Security**. Then remove the variable and restart |
| Account compromised | An admin deactivates or deletes the user in **Admin -> People & access -> Users**. Restore access after a password reset and a passkey review |

A password reset or a deactivation needs `users.manage`. It works only for users whose role does not outrank yours. See [Who can manage whom](/admin/users-roles#who-can-manage-whom).

## SWITCH edu-ID SSO

When `sso.eduid.enabled` is `true`, the login page shows a **SWITCH edu-ID** button. MINT starts an OpenID Connect flow at `/api/auth/sso/eduid/login`, receives the callback at `/api/auth/sso/eduid/callback`, and completes the browser handoff at `/api/auth/sso/eduid/complete`.

Minimal configuration:

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

Requirements:

- Set `server.externalUrl` to the public HTTPS URL. MINT builds the callback URL from it.
- Keep `openid` in `sso.eduid.scopes`.
- Keep at least one local admin account with a password. You need it when the external provider is not available.

With `autoProvision` on (the default), the first edu-ID login creates the MINT user. The identity claim defaults to `swissEduIDUniqueID`, and the username defaults to the `email` claim. For all keys, see [Configuration -> `sso`](/admin/configuration#sso).

## Personal access tokens

Users create personal access tokens for scripts, the `mint` CLI (`MINT_TOKEN`) and AI assistants over MCP. For the user steps and the read-only rules, see [AI assistants and API access](/guide/ai-and-api).

| Property | Behavior |
|----------|----------|
| Format | Starts with `mint_pat_`. MINT shows the secret once and stores only a digest |
| Lifetime | 30, 90 or 365 days (default 90). `auth.patMaxLifetimeDays` (default 365) sets the maximum. Change it in **Admin -> System -> Configuration -> Authentication -> Access token lifetime** |
| Scope | The token acts with the owner's role. A read-only token can only read |
| Accepted by | Every REST route as `Authorization: Bearer`, the plugin proxy, and `/mcp`. The plugin proxy removes the token before it forwards a request, so a plugin in its own process never sees it. A plugin in the platform process still receives the `Authorization` header |
| Limits | A personal access token cannot issue personal access tokens or change sign-in methods (passkey enrol or delete, password set). Those routes answer 403 |
| Ends | On revocation, on expiry, or when the account is deactivated. A password change does not revoke tokens |

**Admin -> People & access -> Access tokens** (needs `users.manage`) lists the unrevoked tokens of every user. Click **Revoke** to end one. The API routes are `GET /api/admin/tokens` and `DELETE /api/admin/tokens/{id}`. The audit log records `api_token.create` and `api_token.revoke`.

> [Screenshot: Admin -> People & access -> Access tokens with tokens of three users and a Revoke button in each row]

If an account is compromised, deactivate it. MINT refuses the sessions and tokens of an inactive account. Revoke its tokens before you activate it again.

## Service tokens

A service token is the credential of an instrument daemon that reports to a plugin. A daemon cannot use a person's session or personal access token. Plugin authors: see [Instrument status](/sdk/recipes/instrument-status).

To create a service token:

1. Grant the instruments to the plugin. Open **Admin -> Plugins -> Installed**, open the plugin's action menu, and choose **Access control**. Set the **Instrument status** block. This needs `instruments.edit`.
2. Open **Admin -> People & access -> Service tokens**. This section needs `users.manage` and `instruments.edit`.
3. Click **New token** and set the fields in the table below.
4. Copy the secret. MINT shows it once.

| Field | Meaning |
|-------|---------|
| **Name** | A label for the token |
| **Plugin** | The one plugin that the token belongs to. The list shows only plugins that declare the `instrument_status` feature (wire flag `instrument_status_write`) |
| **Instruments** | One or more of the instruments granted to that plugin |
| **Expires** | 90 days, 365 days or Never (default) |

> [Screenshot: New service token dialog with a plugin selected and two instruments checked]

| Property | Behavior |
|----------|----------|
| Format | Starts with `mint_svc_`. MINT stores only a digest |
| Reach | Only the routes of its own plugin. The plugin must still declare the feature, and the token must name an instrument that the plugin's grant still holds. Otherwise the request gets 403 `plugin.service_token_scope`. REST `/api` routes and `/mcp` refuse service tokens |
| Plugin sees | MINT removes the token from the request and adds `X-MINT-Service-Token-Id` and `X-MINT-Instrument-Ids` |
| Ends | On revocation or expiry. To revoke, click **Revoke**, then **Confirm**, in the token table |
| Audit | `service_token.create` and `service_token.revoke` |

An uninstall of the plugin revokes its tokens (`service_token.revoke`, system actor). After a reinstall, issue a new token. Tokens of plugins that you uninstalled before MINT 1.4 stay valid; revoke them here.

The API routes are `GET` and `POST /api/admin/service-tokens` and `DELETE /api/admin/service-tokens/{id}`. A personal access token cannot create a service token.

## Device-code sign-in for the `mint` CLI

`mint platform auth login` uses the OAuth device authorization grant (RFC 8628). The user steps are in [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli). For administrators:

- The CLI calls `POST /oauth/device_authorization` and polls `POST /oauth/token`. `/.well-known/oauth-authorization-server` publishes the endpoints.
- The approval page is `<server.externalUrl>/device`. The approval returns a [personal access token](#personal-access-tokens).
- MINT keeps pending codes in memory. A restart cancels them.
- The CLI has no password sign-in. With the second factor on, the approval needs a full session.

## Disabling authentication

`auth.enableAuth: false` or `devMode: true` turns sign-in off, and every visitor becomes an administrator. Never run a reachable server this way. See [Configuration -> `devMode`](/admin/configuration#devmode).

## Rate limiting

MINT limits these paths to 20 requests per 60 seconds per client IP: `/api/auth` (passkey routes included), `/api/setup`, `/api/users/register` and `PUT /api/users/me`. Over the limit, MINT answers 429.

- `/mcp` has its own limit of 240 requests per 60 seconds. `/oauth` has a limit of 60.
- MINT does not rate-limit in dev mode.
- These reads are exempt: `GET /api/auth/config` and `GET /api/setup/config/public`.
- These session checks are exempt, because they take no credential to guess: `GET /api/auth/verify`, `POST /api/auth/refresh`, `POST /api/auth/logout` and `GET /api/auth/passkey/credentials`.
- The sign-in, second-factor, registration and device-code routes keep the limit.

When a session check fails with a status other than 401 (for example 429 or 503), the browser keeps the session. When a session expires or is revoked, a protected page goes to the sign-in page and returns after the sign-in.

MINT reads the client IP from `X-Forwarded-For` only from a trusted proxy. See [Reverse proxy -> Trusted proxies](/admin/reverse-proxy#trusted-proxies).

## Audit log

MINT records sign-ins, token, passkey and TOTP changes, and other security events in the audit log. See [Logs and audit log](/admin/platform-settings#logs-and-audit-log).
