# Use the Hosted Lab Version

When your lab runs a MINT server, you do not install anything. Open the lab's MINT address in a browser and sign in.

## Access MINT

The Morscher Lab address is [mint.morscherlab.org](https://mint.morscherlab.org). Other labs use their own address. If you do not know it, ask your lab administrator.

## Supported browsers

Use a desktop browser of one of these releases or newer:

| Browser | Oldest supported release |
|---------|--------------------------|
| Chrome | 116 |
| Edge | 116 |
| Firefox | 124 |
| Safari | 17.4 |

MINT has no polyfills for older browsers. In an older browser, a request can fail with a `TypeError`. On a phone, MINT shows **Desktop browser required**; see [UI tour -> Sign-in pages](/guide/ui-tour#sign-in-pages).

## Sign in

The sign-in page shows up to three methods. Your admin decides which ones:

- **Sign in with password**: your username or email, and your password.
- **Continue with passkey**: a passkey on your device, such as Touch ID, Windows Hello or a security key. The button shows after you register a passkey in this browser. To register one, open the account menu, choose **Profile**, and go to **Security**.
- **SWITCH edu-ID**: your institutional login, if your lab turned it on.

![MINT sign-in page with the password form and the "No account yet? Create one" link](/screenshots/guide/access-sign-in.webp)

This site has no registered passkey and no edu-ID, so the image shows only the password form.

### Create an account

If the sign-in page shows **No account yet? Create one**, you can register yourself. New accounts get the Member role. An admin must activate your account before you can sign in. Until then, the right password shows **Waiting for approval**. This does not count toward the lockout. If the link is missing, ask your admin to create an account for you. For the password rules and activation, see [Authentication -> Accounts and registration](/admin/authentication#accounts-and-registration).

### Second factor

If your lab requires a second factor, a password or edu-ID sign-in has a second step. Your admin chooses the methods: a passkey (needs an HTTPS site), an authenticator app, or both. The sign-in page shows one of these steps:

- **Verify it's you**: confirm with your passkey, or enter the 6-digit code from your authenticator app. If your account has both, choose one.
- **Set up a passkey**: shows when your account has no second factor and the site offers passkeys. Enter a device name and click **Create passkey**.
- **Set up an authenticator app**: shows when your account has no second factor and the site offers the app. Scan the QR code with an authenticator app, or type the key. Then enter the first 6-digit code. If the site offers both methods, you choose one.

!["Verify it's you" step for an account with an authenticator app: the 6-digit code field and the Verify button](/screenshots/guide/access-verify-totp.webp)

Until you finish this step, the sign-in is valid for 10 minutes only. A direct passkey sign-in counts as both factors and asks for nothing more. A code works once. A wrong code counts like a wrong password toward the lockout.

To add or remove a passkey or the authenticator app, go to **Your account -> Security**. While the second factor is required, you cannot remove your last one. Personal access tokens and the MCP server do not use the second factor.

### Lost second factor

MINT has no recovery codes. If you lose every passkey and your authenticator app, ask an admin to reset them. See [Authentication -> Recovery](/admin/authentication#recovery).

### Lockout

Too many failed password attempts lock the account for some minutes. See [Authentication -> Sign in with a password](/admin/authentication#sign-in-with-a-password).

### Change your password

Go to **Your account -> Password**. The change keeps you signed in on this browser and signs you out everywhere else.

Do not give your password to an AI assistant or a script. Create a personal access token; see [AI Assistants and API Access](/guide/ai-and-api).

## After you sign in

The **Home** page shows your recent experiments and projects, the lab notices, instrument status, and the plugins you can open. See [UI tour -> Home dashboard](/guide/ui-tour#home-dashboard).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Can't reach the server" | Make sure that you are on the lab network or VPN. If you are not sure, ask your admin. |
| A plugin is not visible after sign-in | Your role does not give access to that plugin. Ask your admin to add it to your role's plugin access. |
| Sign-in loops back to the sign-in page | Your browser blocks cookies for the lab domain. Allow them and reload. |
| "Too many failed login attempts" | Wait for the lockout to end, or ask an admin to reset your password. |
| "Verify it's you" shows after every sign-in | Your lab requires a second factor. Use **Continue with passkey** to skip the extra step. |
| The authenticator code is refused | Make sure that the clock of your phone is correct. Wait for the next code, because a code works once. Many wrong codes lock the account. |
| The passkey prompt fails | Use a browser and operating system that support WebAuthn. See [Supported browsers](#supported-browsers). |
| "Permission denied" on a project | You do not have the system permission or project membership for that action. Ask the project lead or an admin to check your access. |
