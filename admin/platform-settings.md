# Platform settings

This page tells administrators how to use the lab-wide settings in **Admin -> Lab content** and **Admin -> System**. Each section appears only to users with the permission in the table.

| Section | Permission | Use |
|---------|------------|-----|
| **Experiment types** | `platform.configure` | Create and edit the types for new experiments |
| **Notices** | `notices.publish` | Post announcements on the home page notice board |
| **Configuration** | `platform.configure` | Edit platform settings |
| **Notifications** | `platform.configure` | Set up email, Teams, Slack and Apple Push delivery |
| **Access tokens** | `users.manage` | List and revoke the personal access tokens of every user. See [Personal access tokens](/admin/authentication#personal-access-tokens) |
| **Service tokens** | `users.manage` and `instruments.edit` | Issue and revoke tokens for instrument daemons. See [Service tokens](/admin/authentication#service-tokens) |
| **Server** | `platform.configure` | Check versions, the database, caches and plugin processes |
| **Terminal** | `platform.configure` | Run commands in the server environment. Off by default. See [Admin terminal](/reference/permissions#admin-terminal) |
| **Logs** | `platform.view_logs` | Read and filter the platform log |

![Admin navigation rail with the People & access, Plugins, Lab content and System groups](/screenshots/admin/platform-settings-admin-rail.webp)

## Experiment types

The **Type** list of the new-experiment form shows only these types. Plugins do not create them. Create a type before users need it.

1. Open **Admin -> Lab content -> Experiment types**.
2. Fill in the **New type** form with the fields below.
3. Click **Create type**.

| Field | Rules |
|-------|-------|
| **Label** | Display name, up to 100 characters |
| **Slug** | The value in codes and URLs. MINT fills it from the label. Lowercase letters, digits and underscores, starting with a letter, up to 50 characters. You cannot change it later |
| **Description** | Optional |
| **Colour** | Optional. Click one of the preset colours |
| **Sort** | Lower numbers appear first. A new type goes after the last type. Change it with the pencil button of the row |
| **Active** | The switch in the row. The new-experiment form hides inactive types |

![Experiment types list with the New type form filled in for a Lipidomics type](/screenshots/admin/platform-settings-experiment-types.webp)

The slug sets the prefix of the experiment code:

- A slug with underscores uses the first letter of each word: `dose_response` → `DR-EXP-001`.
- A slug of up to three characters stays as it is: `drp` → `DRP-EXP-001`.
- A longer single word uses its first three letters: `lcms` → `LCM-EXP-001`.

For how experiments get their numbers, see [Experiment numbers](/guide/experiments#experiment-numbers).

## Notices

Notices appear on the home page notice board for every signed-in user. In **Admin -> Lab content -> Notices**, a user with `notices.publish` can post, edit and delete notices.

| Field | Rules |
|-------|-------|
| **Title** and **Body** | Required |
| **Audience** | Free text shown with the notice, up to 120 characters. Default "All lab members". It does not limit who sees the notice |
| **Pinned** | Keeps the notice at the top |
| **Expires** | Optional date after which MINT hides the notice |

![Home page with the notice board showing one pinned notice](/screenshots/admin/platform-settings-notice-board.webp)

## Notifications

Plugins publish events, and MINT delivers them. Configure delivery in **Admin -> System -> Notifications**:

| Channel | Settings |
|---------|----------|
| **SMTP email** | Host, port (default 587), TLS mode (STARTTLS, implicit TLS or none), from address and name, username, password |
| **Microsoft Teams** | Named channels, each with a Teams Workflow webhook URL. MINT posts alerts as Adaptive Cards. See [Teams and Slack channels](#teams-and-slack-channels) |
| **Slack** | Named channels, each with an incoming webhook URL. See [Teams and Slack channels](#teams-and-slack-channels) |
| **Apple Push** | See [Push notifications](#push-notifications) |

Each channel has a test action: **Test SMTP connection** for email, **Test** in each Teams or Slack channel row, and **Send test push** for Apple Push. The **Failed deliveries** table lists the failed sends by channel, plugin, event, attempts and last attempt. To send one again, click the retry button in its row.

Email for important events goes to the owner of the event and to every active user whose role has `notifications.receive_important`. A plugin can also name a recipient with `owner_user_id`. That active user then also gets the event by email and push.

![SMTP email settings with email delivery on and a successful connection test](/screenshots/admin/platform-settings-smtp.webp)

![Failed deliveries table with one failed email delivery and its retry button](/screenshots/admin/platform-settings-failed-deliveries.webp)

### Teams and Slack channels

Teams and Slack each hold a list of named channels. A channel is a name and a write-only webhook URL. MINT encrypts the URL, and the panel never shows it again. A name uses lowercase letters, digits and hyphens. A webhook URL must be an absolute `https://` URL.

In **Admin -> System -> Notifications**, use the **Teams channels** and **Slack channels** groups:

1. Switch on **Teams delivery** (or **Slack delivery**) and click **Save**.
2. Under **Add channel**, enter a name and the webhook URL, then click **Add**. The first channel of a service becomes its default.
3. Click **Test** in a channel row. MINT sends one test message to that channel.
4. To change the default, click **Set default**. A message that names only the service goes to the default channel.
5. To replace a webhook URL, edit the channel and click **Save URL**.
6. To delete a channel, click **Remove**. You can remove the default channel only when it is the last channel. Otherwise, set another default first (409 `notification_channel.default_in_use`).

![Teams channels with lab-alerts as the default channel, ms-facility, and the Add channel form](/screenshots/admin/platform-settings-teams-channels.webp)

A removed channel fails its pending deliveries with `channel_removed`. MINT does not retry them.

A config from before named channels has one `webhookUrl` (or `MINT_NOTIFICATIONS__TEAMS__WEBHOOK_URL`). MINT reads it as the channel `default`. The next save in this panel writes the new format. For the `config.json` keys, see [`notifications`](/admin/configuration#notifications).

The routes need `platform.configure`. The audit log records them as `config.update`:

| Route | Effect |
|-------|--------|
| `PATCH /api/admin/notifications/integrations/{teams\|slack}` | Switch the service on or off |
| `POST /api/admin/notifications/integrations/{teams\|slack}/channels` | Add a channel (`name`, `webhookUrl`) |
| `PATCH` and `DELETE .../channels/{name}` | Replace the URL, or remove the channel |
| `POST .../channels/{name}/default` | Make the channel the default |
| `POST .../channels/{name}/test` | Send a test message to the channel. `POST .../{teams\|slack}/test` tests the default channel |

A plugin reads the channel names, never the URLs, and chooses the channels for each message. See [Notifications -> For plugin authors](/guide/notifications#for-plugin-authors).

A message to another person or to a Teams or Slack channel needs a sender with `notifications.broadcast`. The Admin role has it. To give it to other roles, use **Admin -> People & access -> Roles**. See [Permissions](/reference/permissions#notifications-2).

## Push notifications

MINT sends push notifications to the MINT iOS app through Apple Push (APNs). For who gets which push, see [Notifications and iOS push](/guide/notifications#what-you-receive). The push categories are `alerts`, `jobs`, `instrument_finished` and `instrument_error`.

To set up Apple Push:

1. Open **Admin -> System -> Notifications -> Apple Push** (needs `platform.configure`).
2. Choose the transport and fill in its settings (see the table below).
3. Click **Send test push**. MINT sends a push to your own devices and shows the answer of Apple or the relay, for example `APNs returned HTTP 403 InvalidProviderToken`. The platform log records it too.

| Setting | Meaning |
|---------|---------|
| **Transport** | `relay` (default): MINT sends to a push relay that holds the Apple key. `direct`: MINT signs with your own `.p8` key |
| **Topic** | The app bundle ID. Default `org.morscherlab.mint` |
| **Relay URL** and **key** | For `relay`. HTTPS only. MINT has no default relay URL. A URL without a path gets `/v1/push` |
| **Team ID**, **Key ID**, **private key** | For `direct` |

MINT encrypts the keys and shows only whether each one is set.

- A phone registers its device with a write-scoped [personal access token](/admin/authentication#personal-access-tokens). A session token gets 403.
- Administrators see all devices at `GET /api/admin/push-devices` (`users.manage`).
- Before each push, MINT checks the device, its token, the account, the permission and the category.
- A revoked token, a deactivated account, or an Apple answer 400 `BadDeviceToken` or 410 disables the device. A relay error never disables it.
- `POST /api/auth/logout` deletes the devices of the token that it revokes.

## Calendar subscriptions

Plugins can publish calendar events, for example instrument bookings. A user subscribes in the info panel of a plugin on the home page, under **Calendar subscriptions**. The user gets a private ICS feed URL (`/api/calendar/feed/<token>.ics`) for a calendar app. Each feed has two scopes:

| Scope | Who can subscribe |
|-------|-------------------|
| **Personal** | Any user, for their own events |
| **Global** | Users whose role has `calendar.read_all` |

A feed URL works without sign-in, so keep it secret. If it leaks, rotate it in the same panel. The old URL then stops working.

## Server health

**Admin -> System -> Server** has these cards:

- **Resources**: CPU, memory and disk of the host, the platform version, the uptime, the number of installed plugins and the authentication state.
- **Database**: the database engine and the connection pool in use.
- **Plugin processes**: plugins that run in their own process on a separate port.
- **Background activity**: background operations and the state of each background task.
- **Server actions**: the current sessions and jobs, and **Restart server**.

![Server section with the Database, Plugin processes and Background activity cards](/screenshots/admin/platform-settings-server.webp)

For monitoring, MINT has these endpoints:

| Endpoint | Access | Returns |
|----------|--------|---------|
| `GET /api/health` | Public | Liveness: `status`, `version` and `boot_id`. No database access. `boot_id` changes at each process start, so a new value confirms a restart |
| `GET /api/health/ready` | `platform.view_logs`, or `Authorization: Bearer <token>` | Readiness: PostgreSQL and object-storage reachability, connection-pool statistics, and the plugin inventory with the SDK version and API compatibility of each plugin. Returns 503 when the database check fails |
| `GET /api/admin/object-cleanup` | `platform.view_logs` | The object-cleanup queue. An experiment delete writes one cleanup job for each stored object, and a background worker deletes the objects after the commit, so the delete does not wait for the storage |

To let an external monitor read the readiness report without a user account, set `server.healthReadyToken` (`MINT_SERVER__HEALTH_READY_TOKEN`). The `HEALTHCHECK` of the Docker image probes `/api/health`.

To find a slow start, read the startup log. It has one `Startup phase '...' took` line for each phase and a `Startup complete in` summary.

## Logs and audit log

**Admin -> System -> Logs** (`platform.view_logs`) shows the platform log, including tracebacks from plugin jobs. Users with `platform.configure` set the log level in **Configuration**. `logging.fileEnabled` and `logging.filePath` control file logging.

MINT also keeps an audit log in the database. It records:

- Sign-ins and registrations: `auth.login_success`, `auth.login_failure` (password, passkey and TOTP), `auth.password_check_failure`, `user.register`, `user.create`.
- Credentials: `api_token.create`, `api_token.revoke`, `service_token.create`, `service_token.revoke`, `passkey.admin_reset`, `totp.enrol`, `totp.delete`.
- Changes to projects, experiments, experiment types, notices, roles, settings and plugins.
- Plugin writes to experiments (`experiment.create`, `experiment.update`, `experiment.status_change`, `experiment.delete`, `experiment.design_data_save`), with the user who caused them as the actor.
- Every write to `config.json` through the admin panel or the API. Secret values are redacted.
- Other actions, for example `platform.update`, `plugin.install`, `plugin.upload`, `plugin.upgrade`, `plugin.uninstall`, `terminal.session_start`, `analysis.artifact_*` and MCP write calls (`mcp.tool_call`).

There is no audit page in the UI. Read the log through the API with the token of a user with `platform.view_logs`:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://mint.example.org/api/admin/audit?action=auth.&limit=100"
```

| Parameter | Filters by |
|-----------|------------|
| `action` | Action prefix, for example `auth.` or `experiment.` |
| `entity_type`, `entity_id` | The changed object |
| `actor_id` | The user who acted |
| `since`, `until` | Time range (ISO 8601) |
| `skip`, `limit` | Paging. `limit` up to 500 |

MINT returns events newest first. Client IPs follow the trusted-proxy rule; see [Trusted proxies](/admin/reverse-proxy#trusted-proxies).

With `audit.retentionDays` above 0, MINT deletes older events once a day and records the deletion as `audit.purge`. See [`audit`](/admin/configuration#audit).

### Audit log and feedback

Signed-in users send feedback (a bug, an idea or other) with **Send feedback** in the account menu. Each submission is one `feedback.submit` audit event with the text, the page path, the user agent and the platform version.

- A user can send 10 submissions per hour.
- The retention purge keeps these events.
- There is no viewer in the UI. Read the feedback with `mint platform admin feedback`, or with `GET /api/admin/audit?action=feedback.`.

## Server file browser

Plugins can let users pick files from server directories, such as an instrument share. Declare each directory as a read-only mount in `config.json`:

```json
{
  "filesystem": {
    "mounts": [
      { "id": "raw", "path": "/mnt/instrument-raw", "label": "Instrument RAW files" }
    ]
  }
}
```

| Key | Rules |
|-----|-------|
| `id` | Unique, not empty |
| `path` | Absolute path on the server. MINT never sends it to browsers. Users see only the id and the label |
| `label` | Display name. Defaults to the id |

- The file browser routes exist only when at least one mount is configured.
- A user needs `filesystem.browse`. Admin and Member have it.
- When authentication is off, browsing stays closed unless `filesystem.allowUnauthenticated` is `true`.
- An offline mount shows as unavailable and does not block startup.
- Restart MINT after you change the mounts.
