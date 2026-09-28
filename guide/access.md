# Use the Hosted Lab Version

If your lab operates a MINT server, no local installation is required. Access the lab's MINT URL through a web browser and authenticate with your lab credentials.

> [Screenshot: MINT login page on a hosted instance]

## Access MINT

The Morscher Lab default URL is [mint.morscherlab.org](https://mint.morscherlab.org). Other deployments use site-specific URLs; consult your lab administrator if the address is not known.

## Log in

The login page offers up to three ways in, depending on how your admin set up MINT:

- **Sign in with password** — your username or email and password.
- **Continue with Passkey** — a passkey on your device (Touch ID, Windows Hello, a security key). Register one first from **Your account -> Security** after signing in with your password.
- **SWITCH edu-ID** — your institutional login, if your lab enabled it.

No account yet? If the login page shows **No account yet? Create one**, you can register yourself; passwords need at least 8 characters, and new accounts start with the Member role. If the link is missing, ask your admin to create an account for you.

After five failed password attempts, the account is locked for 15 minutes by default.

Changing your password in **Your account -> Password** keeps you signed in on that browser and signs you out everywhere else. To connect an AI assistant or a script, create a personal access token instead of sharing your password; see [AI Assistants and API Access](/guide/ai-and-api).

> [Screenshot: MINT login page showing the password form, Continue with Passkey, and the Create one link]

## Find your projects and plugins

After logging in, the **Home** page shows:

- **Needs you** reminders and the lab **Notice board**
- **Experiments** and **Projects** cards, each with a switch to show only yours
- A **Plugins** launcher with the plugins your role may open; pin the ones you use most

Use the top navigation to open the full **Experiments** and **Projects** lists. **Instruments** in the top navigation opens the lab's [shared instrument directory](/guide/instruments).

> [Screenshot: home dashboard with projects, experiments, and plugins highlighted]

## What's different from running your own MINT?

| | Self-managed (direct or Docker) | Hosted (lab) |
|---|---|---|
| **Where data lives** | On your own server | On the lab server |
| **Login** | You configure auth (passkeys, SSO) | Lab credentials, possibly SSO |
| **Plugin installs** | Anyone with admin rights | Admin-only, often via approval workflow |
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
| Passkey prompt fails | Make sure you're using a browser and OS that support WebAuthn — recent Chrome, Safari, Firefox, or Edge. |
| "Permission denied" on a project | You may not have the system permission or project membership needed for that action. Ask the project lead or an admin to check your access. |

## Next step

→ [First experiment (5 minutes)](/guide/quickstart) — same workflow on self-managed and hosted
