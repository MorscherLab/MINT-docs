# Notifications and iOS push

MINT sends a short message when something needs your attention. This page tells you what you receive and how to get push messages on the MINT iOS app.

Your admin chooses the channels: email, Microsoft Teams or Slack channels, and push messages to the iOS app. The web app has no notification bell. For the admin setup, see [Push notifications](/admin/platform-settings#push-notifications).

## What you receive

| Message | Who gets it | Example title |
|---------|-------------|---------------|
| Critical alert from a plugin | Users with the permission `notifications.receive_important`, and the user that the plugin names as the owner of the alert | The alert title |
| Finished job | The user that started the job | `Job completed: <job name>` or `Job failed: <job name>` |
| Finished run | Every user with `instruments.view` | `<instrument>: run finished` |
| Instrument error | Every user with `instruments.view` | `<instrument>: error` |

Critical alerts also go to the email, Teams and Slack channels that your admin set up; see [Teams and Slack channels](/admin/platform-settings#teams-and-slack-channels). A finished job also goes to its owner by email. Finished runs and instrument errors are push only.

A push has one title line and a body of at most 178 characters. A push never names a sample, a file path, or alert details. Tap a push to open the instrument or the job in the app.

For one instrument, MINT sends error pushes at least 10 minutes apart. A finished run is never held back.

## Connect the iOS app

Push needs a version of the MINT iOS app that supports push. Ask your admin which version to install.

1. In the app, enter the address of your MINT server. Keep **Read-Only Token** off.
2. The app shows a device code. Approve it on the `/device` page of your MINT server; see [Sign in the mint CLI](/guide/ai-and-api#sign-in-the-mint-cli).
3. Allow notifications when the app asks.

The approval creates a personal access token for the app. The token shows in **Your account -> AI & API**. The app uses it to register your phone. A push goes only to a phone that is registered with a token of its user.

## Stop push messages

- Sign out in the app. MINT removes the phone and its token.
- Revoke the token in **Your account -> AI & API**.

When an admin deactivates your account, all pushes stop at once.

MINT also stops sending to a phone when Apple reports that its device token is no longer valid.

## For plugin authors

A plugin can send a message to named Teams or Slack channels. The admin sets up the channels; see [Teams and Slack channels](/admin/platform-settings#teams-and-slack-channels).

- `await context.notification_channels()` returns the channel names and the default of each service, never the webhook URLs. A service that is not set up has no names. It raises `UnavailableException` when the context cannot reach the platform, for example in standalone mode.
- `await context.enqueue_notifications(function_id=..., channels=..., events=..., channel_names={"teams": {"lab-a"}}, on_behalf_of=user_id)` sends events to those channels. Without `channel_names`, a service reaches its default channel. An unknown name is refused with `notifications.unknown_channel` (400). Declare the channels in `Metadata.notifications` when you do not use `@notify`.
- `on_behalf_of` is a platform user id. The platform then checks that user. An `important` event, or any Teams or Slack channel, needs an active user with `notifications.broadcast` (`notifications.broadcast_forbidden`, 403). An `owner` event must name that user as `owner_user_id` (`notifications.owner_mismatch`, 403). A direct call without `on_behalf_of` is checked for the user that the request binds. `@notify` and a call with no bound user keep the plugin's own authority.
- A refusal raises `NotificationDispatchError` with the `code`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No push arrives | Ask your admin to make sure that Apple Push is set up. Make sure that your role has `instruments.view` (instrument messages) or `notifications.receive_important` (alerts). |
| The app cannot register the phone | Sign out in the app and sign in again with **Read-Only Token** off. A read-only token and a browser session cannot register a phone. |
| Pushes stopped after a while | The token expired or was revoked. Sign in to the app again. |
