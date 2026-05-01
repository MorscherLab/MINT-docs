# Use the Hosted Lab Version

If your lab operates a MINT server, no local installation is required. Access the lab's MINT URL through a web browser and authenticate with your lab credentials.

> [Screenshot: MINT login page on a hosted instance]

## Access MINT

The Morscher Lab default URL is [mint.morscherlab.org](https://mint.morscherlab.org). Other deployments use site-specific URLs; consult your lab administrator if the address is not known.

## Log in

Use the credentials your lab admin gave you. MINT supports two authentication methods:

- **Password + JWT** — username/email and password, with optional MFA via passkey
- **Passkey only** — WebAuthn / hardware security key, no password to remember

If your lab uses single sign-on (SSO), the login page redirects to your identity provider; otherwise log in directly with your MINT credentials. See [Authentication](/workflow/auth-passkeys) for the full picture.

> [Screenshot: MINT login page showing both password and passkey options]

## Find your projects and plugins

After logging in, the **Home** dashboard lists:

- Projects you're a member of (recent activity, members, experiment counts)
- Experiments you own or collaborate on
- Plugins available to you, by plugin role

Click any tile to drill in. The exact dashboard layout depends on how your admin configured the lab's instance.

> [Screenshot: home dashboard with projects, experiments, and plugins highlighted]

## What's different from running your own MINT?

| | Self-managed (direct or Docker) | Hosted (lab) |
|---|---|---|
| **Where data lives** | On your own server | On the lab server |
| **Login** | You configure auth (passkeys, SSO) | Lab credentials, possibly SSO |
| **Plugin installs** | Anyone with admin rights | Admin-only, often via approval workflow |
| **Updates** | You upgrade the wheel or pull a newer image | Admin updates the platform on a schedule |
| **Sharing** | Within your install | Built-in — collaborators land on the same project URL |

The day-to-day workflow (creating experiments, running plugins, viewing results) is identical.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Can't reach the server" | Check you're on the lab network or VPN. Ask your admin if you're not sure. |
| "Plugin not visible after login" | Your account may not have access to that plugin. Ask your admin to grant the plugin role. |
| Login loops back to the page | Cookies (or third-party cookies) may be blocked for the lab domain. Allow them and reload. |
| Passkey prompt fails | Make sure you're using a browser and OS that support WebAuthn — recent Chrome, Safari, Firefox, or Edge. |
| "Permission denied" on a project | You're not a member, or your project role is read-only. Ask the project owner to invite you. |

## Next step

→ [First experiment (5 minutes)](/get-started/quickstart) — same workflow on self-managed and hosted
