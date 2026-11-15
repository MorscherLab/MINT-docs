# Use the Hosted Lab Version

If your lab operates a MINT server, no local installation is required. Access the lab's MINT URL through a web browser and authenticate with your lab credentials.

> [Screenshot: MINT login page on a hosted instance]

## Access MINT

The Morscher Lab default URL is [mint.morscherlab.org](https://mint.morscherlab.org). Other deployments use site-specific URLs; consult your lab administrator if the address is not known.

## Log in

The login page offers up to three ways in, depending on how your admin set up MINT:

- **Sign in with password** — your username or email and password.
- **Continue with passkey** — a passkey on your device (Touch ID, Windows Hello, a security key). The button shows after you register a passkey in this browser. Register one in **Your account -> Security** (account menu -> **Profile**).
- **SWITCH edu-ID** — your institutional login, if your lab enabled it.

No account yet? If the login page shows **No account yet? Create one**, you can register yourself; passwords need at least 8 characters and at most 72 bytes (UTF-8), and new accounts start with the Member role. An admin must activate a new account before you can sign in. If the link is missing, ask your admin to create an account for you.

If your lab requires a second factor, a password or edu-ID sign-in is followed by a second step. Your admin chooses the methods: a passkey (needs an HTTPS site), an authenticator app, or both. The login page shows the step:

- **Verify it's you** — confirm with your passkey, or enter the 6-digit code from your authenticator app. If your account holds both, choose one.
- **Set up a passkey** — shown when your account has no second factor yet and the site offers passkeys. Enter a device name and click **Create passkey**.
- **Set up an authenticator app** — shown when your account has no second factor yet and the site offers the app. Scan the QR code with an authenticator app (or type the key), then enter the first 6-digit code. If the site offers both methods, you choose which one to set up.

Until you finish this step, the sign-in is valid for 10 minutes only. A direct passkey sign-in counts as both factors, so it asks for nothing more. A code works once, and a wrong code counts like a wrong password toward the lockout.

You can add or remove a passkey or the authenticator app in **Your account -> Security**. While the second factor is required, you cannot remove your last one. MINT has no recovery codes. If you lose every passkey or your authenticator app, ask an admin to reset them in **Admin -> People -> Users**; the reset removes your passkeys and your authenticator app and signs you out everywhere. See [Authentication -> Recovery](/admin/authentication#recovery). Personal access tokens and the MCP server do not use the second factor.

If you enter the right password for an account that an admin has not activated yet, MINT shows **Waiting for approval** instead of a password error. Ask an admin to activate the account in **Admin -> People -> Users**. Waiting does not count toward the lockout.

After five failed password attempts, the account is locked for 15 minutes by default.

Changing your password in **Your account -> Password** keeps you signed in on that browser and signs you out everywhere else. To connect an AI assistant or a script, create a personal access token instead of sharing your password; see [AI Assistants and API Access](/guide/ai-and-api).

> [Screenshot: MINT login page showing the password form, Continue with Passkey, and the Create one link]

## Find your projects and plugins

After logging in, the **Home** page shows a short tour of the top bar and a **Getting started** chip the first time; see [UI tour -> Help and tours](/guide/ui-tour#help-and-tours). The page shows:

- **Needs you** reminders and the lab **Notice board**
- **Experiments** and **Projects** cards, each with a switch to show only yours
- An **Instruments** card with live instrument status, when your role can view instruments
- A **Plugins** launcher with the plugins your role may open, shown by display name; search by name or plugin ID and pin the ones you use most

Use the **Experiments** menu in the top navigation to open the full **Experiments** and **Projects** lists. **Instruments** in the top navigation opens the [live status of the lab's instruments](/guide/instruments).

> [Screenshot: home dashboard with projects, experiments, and plugins highlighted]

## What's different from running your own MINT?

| | Self-managed (direct or Docker) | Hosted (lab) |
|---|---|---|
| **Where data lives** | On your own server | On the lab server |
| **Login** | You configure auth (passkeys, SSO) | Lab credentials, possibly SSO |
| **Plugin installs** | Anyone with admin rights | Admin-only; ask your admin |
| **Updates** | You apply new releases | Admin updates the platform on a schedule |
| **Sharing** | Within your install | Built-in — collaborators land on the same project URL |

The day-to-day workflow (creating experiments, running plugins, viewing results) is identical.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Can't reach the server" | Check you're on the lab network or VPN. Ask your admin if you're not sure. |
| "Plugin not visible after login" | Your role may not include that plugin. Ask your admin to add it to your role's plugin access. |
| Login loops back to the page | Cookies may be blocked for the lab domain. Allow them and reload. |
| "Too many failed login attempts" | Wait for the lockout to end (15 minutes by default) or ask an admin to reset your password. |
| "Verify it's you" appears after every sign-in | Your lab requires a second factor. Sign in with **Continue with passkey** to skip the extra step. |
| The authenticator code is refused | Check that the clock of your phone is correct. Wait for the next code, because a code works once. Several wrong codes lock the account for a while. |
| Passkey prompt fails | Make sure you're using a browser and OS that support WebAuthn — recent Chrome, Safari, Firefox, or Edge. |
| "Permission denied" on a project | You may not have the system permission or project membership needed for that action. Ask the project lead or an admin to check your access. |

## Next step

→ [First experiment (5 minutes)](/guide/quickstart) — same workflow on self-managed and hosted
