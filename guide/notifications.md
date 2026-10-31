# Notifications and iOS push

MINT sends a short message when something needs your attention. Your admin chooses the channels: email, a Microsoft Teams or Slack channel, and push messages to the MINT iOS app. The web app has no notification bell.

This page describes what you receive on your phone. Admins: set up Apple Push in **Admin -> Platform -> Configuration**, in the **Apple Push** group. There you choose the relay or direct transport and the topic, and click **Send test push**.

## What you receive

| Message | Who gets it | Example title |
|---------|-------------|---------------|
| **Critical alert** from a plugin | Users with the permission `notifications.receive_important`, and the user that the plugin names as the owner of the alert | The alert title |
| **Finished job** | The user that started the job | `Job completed: <job name>` or `Job failed: <job name>` |
| **Finished run** | Every user with `instruments.view` | `<instrument>: run finished` |
| **Instrument error** | Every user with `instruments.view` | `<instrument>: error` |

Critical alerts also go to the email, Teams, and Slack channels that your admin set up. A finished job also goes to its owner by email. The finished run and the instrument error messages are push only.

MINT keeps push text short: one title line and a body of at most 178 characters. A push never names a sample, a file path, or alert details. Tap a push to open the instrument or the job in the app.

For one instrument, MINT sends error pushes at least 10 minutes apart. A finished run is never held back.

## Connect the iOS app

Push needs a version of the MINT iOS app that supports push. Ask your admin which version to install.

1. In the app, enter the address of your MINT server. Keep **Read-Only Token** off.
2. The app shows a device code. Approve it on the `/device` page of your MINT server, as for the `mint` CLI. See [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli).
3. Allow notifications when the app asks.

The approval creates a personal access token for the app. It appears in **Your account -> AI & API**. The app uses the token to register your phone with MINT. A push goes only to a phone that is registered with a token of its user.

## Stop push messages

- **Sign out in the app.** MINT removes the phone together with its token.
- **Revoke the token** in **Your account -> AI & API**. The phone stops receiving pushes.
- **Account deactivation.** When an admin deactivates your account, every push stops at once.

MINT also stops sending to a phone when Apple reports that its device token is no longer valid.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No push arrives | Ask your admin to check that Apple Push is set up. **Send test push** sends to the admin's own phones. Check that your role has `instruments.view` (instrument messages) or `notifications.receive_important` (alerts). |
| The app cannot register the phone | Sign out in the app and sign in again with **Read-Only Token** off. A read-only token and a browser session cannot register a phone. |
| Pushes stopped after a while | The token expired or was revoked. Sign in to the app again. |

## Next

→ [Instruments](/guide/instruments) — the pages that a push opens
→ [AI Assistants and API Access](/guide/ai-and-api) — personal access tokens
