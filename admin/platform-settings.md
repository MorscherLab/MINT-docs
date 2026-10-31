# Platform settings

The **Admin -> Platform** group holds the lab-wide settings that are not tied to one plugin. Each section appears only to users with the permission shown.

| Section | Permission | Use it to |
|---------|------------|-----------|
| **Experiment types** | `platform.configure` | Create and edit the types users pick for new experiments |
| **Notices** | `notices.publish` | Post announcements to the home page notice board |
| **Configuration** | `platform.configure` | Edit platform settings, including notification delivery |
| **Access tokens** | `users.manage` | List and revoke the personal access tokens of every user; see [Authentication](/admin/authentication#personal-access-tokens) |
| **Service tokens** | `users.manage` and `instruments.edit` | Issue and revoke tokens for instrument daemons; see [Service tokens](/admin/authentication#service-tokens) |
| **Server** | `platform.configure` | Check versions, database, caches, and plugin processes |
| **Terminal** | `platform.configure` | Run commands in the server environment (off by default; see [Docker install](/admin/install-docker#optional-admin-terminal)) |
| **Logs** | `platform.view_logs` | Read and filter the platform log |

> [Screenshot: Admin navigation rail with the People, Plugins, and Platform groups expanded]

## Experiment types

Experiment types are the only source of the **Type** list in the new-experiment form. Plugins do not create them. Create a type before users need it.

Open **Admin -> Platform -> Experiment types** and add a type:

| Field | Rules |
|-------|-------|
| **Value** | Slug used in codes and URLs: lowercase letters, digits, and underscores, starting with a letter, up to 50 characters. Cannot be changed later. |
| **Label** | Display name, up to 100 characters |
| **Description** | Optional |
| **Color** | Optional `#RRGGBB` |
| **Sort order** | Lower numbers appear first |
| **Active** | Inactive types are hidden from the new-experiment form |

> [Screenshot: Experiment types section with the add-type form]

The value decides the experiment code prefix. A slug with underscores uses the first letter of each word (`dose_response` → `DR-EXP-001`), a slug of up to three characters is used as is (`drp` → `DRP-EXP-001`), and a longer single word uses its first three letters (`lcms` → `LCM-EXP-001`).

## Notices

Notices appear on the home page notice board for every signed-in user. In **Admin -> Platform -> Notices**, a user with `notices.publish` can post, edit, and delete notices.

| Field | Notes |
|-------|-------|
| **Title** and **Body** | Required |
| **Audience** | Free text shown with the notice, up to 120 characters; defaults to "All lab members". It does not restrict who sees the notice. |
| **Pinned** | Keeps the notice at the top |
| **Expires** | Optional date after which the notice is no longer shown |

> [Screenshot: notice board on the home page with a pinned notice]

## Notifications

Plugins publish events; MINT delivers them. Configure delivery in **Admin -> Platform -> Configuration** under the notification settings:

| Channel | Settings |
|---------|----------|
| **SMTP email** | Host, port (default 587), TLS mode (STARTTLS, implicit TLS, or none), from address and name, username, password |
| **Microsoft Teams** | Teams Workflow webhook URL (alerts are posted as Adaptive Cards) |
| **Slack** | Incoming webhook URL |
| **Apple Push** | See [Push notifications](#push-notifications) |

Each channel has a test action. The deliveries table lists recent sends by channel, plugin, event, and attempts, and failed deliveries can be retried.

Email for important events goes to the event's owner and to every active user whose role has `notifications.receive_important`. A plugin can also name a recipient with `owner_user_id`; that active user gets the event by email and push in addition.

> [Screenshot: notification settings with SMTP enabled and the deliveries table]

## Push notifications

MINT sends push notifications to the MINT iOS app through Apple Push (APNs). The phone registers its device with a write-scoped [personal access token](/admin/authentication#personal-access-tokens); a session token gets 403. Administrators see all devices at `GET /api/admin/push-devices` (`users.manage`).

Set up Apple Push in **Admin -> Platform -> Configuration -> Notifications -> Apple Push** (`platform.configure`):

| Setting | Meaning |
|---------|---------|
| **Transport** | `relay` (default): MINT sends to a push relay that holds the Apple key. `direct`: MINT signs with your own `.p8` key |
| **Topic** | The app bundle ID. Default `org.morscherlab.mint` |
| **Relay URL** and **key** | For `relay`. HTTPS only. MINT has no default relay URL. A URL without a path gets `/v1/push` |
| **Team ID**, **Key ID**, **private key** | For `direct` |

MINT stores the keys encrypted and shows only whether each one is set. **Send test push** sends to your own devices and shows Apple's or the relay's answer (for example `APNs returned HTTP 403 InvalidProviderToken`); the platform log records it too. The categories:

| Category | Who gets it |
|----------|-------------|
| `alerts` | Critical plugin alerts: the important recipients (`notifications.receive_important`) and the event owner |
| `jobs` | The owner of a finished job |
| `instrument_finished`, `instrument_error` | Every active user with `instruments.view`: a finished sequence, or a change to `error`. An error push for one instrument comes at most every 10 minutes |

Before each push, MINT checks the device, its token, the account, the permission and the category. A revoked token, a dead account, or an Apple 400 `BadDeviceToken` or 410 answer disables the device. A relay error never disables it. Push text has a short title and body, with no sample names, paths or alert detail. `POST /api/auth/logout` deletes the devices of the token that it revokes.

## Calendar subscriptions

Plugins can publish calendar events (for example instrument bookings). Users subscribe from a plugin's info panel on the home page, under **Calendar subscriptions**, and get a private ICS feed URL (`/api/calendar/feed/<token>.ics`) for their calendar app. Each feed has two scopes:

| Scope | Who can subscribe |
|-------|-------------------|
| **Personal** | Any user, for their own events |
| **Global** | Users whose role has `calendar.read_all` |

A feed URL works without signing in, so treat it as a secret. Rotate it from the same panel if it leaks; the old URL stops working.

## Server health

**Admin -> Platform -> Server** shows the platform version, database, caches, background operations, and the **Plugin processes** card for isolated plugins.

For monitoring, MINT exposes two endpoints:

| Endpoint | Access | Returns |
|----------|--------|---------|
| `GET /api/health` | Public | Constant-time liveness: `status`, `version`, and `boot_id`. `boot_id` changes every time the server process starts, so a changed value confirms a restart happened. No database access. |
| `GET /api/health/ready` | `platform.view_logs`, or `Authorization: Bearer <token>` | Readiness: PostgreSQL and object-storage reachability, connection-pool stats, and the plugin inventory. Returns 503 when the database check fails. |

Set the bearer token with `server.healthReadyToken` (`MINT_SERVER__HEALTH_READY_TOKEN`) so an external monitor can read the readiness report without a user account. The readiness report also lists each plugin's SDK version and API compatibility. The Docker image's `HEALTHCHECK` probes `/api/health`.

The startup log has one `Startup phase '...' took` line for each phase and a `Startup complete in` summary. Use them to find a slow start.

## Logs and audit log

**Admin -> Platform -> Logs** (`platform.view_logs`) shows the platform log, including tracebacks from plugin jobs. Users with `platform.configure` set the log level in **Configuration**. File logging is set with `logging.fileEnabled` and `logging.filePath`.

MINT also keeps an audit log in the database: sign-ins (`auth.login_success`, `auth.login_failure`), registrations, and changes to projects, experiments, experiment types, notices, roles, settings and plugins. Plugin writes to experiments are recorded too (`experiment.create`, `experiment.update`, `experiment.status_change`, `experiment.delete`, `experiment.design_data_save`), with the user who caused them as the actor. Every write to `config.json` through the admin panel or the API is recorded; secret values are redacted. Other recorded actions include `platform.update`, `plugin.install`, `plugin.upload`, `plugin.upgrade`, `plugin.uninstall`, `terminal.session_start` and `analysis.artifact_*`. There is no audit page in the UI. Read it with the API, using a token from a user with `platform.view_logs`:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://mint.example.org/api/admin/audit?action=auth.&limit=100"
```

| Parameter | Filters by |
|-----------|------------|
| `action` | Action prefix, e.g. `auth.` or `experiment.` |
| `entity_type`, `entity_id` | The changed object |
| `actor_id` | The user who acted |
| `since`, `until` | Time range (ISO 8601) |
| `skip`, `limit` | Paging; `limit` up to 500 |

Events are returned newest first. Client IPs in the log follow the same trusted-proxy rule as the rate limiter (see [Reverse proxy](/admin/proxy-and-setup#reverse-proxy)).

With `audit.retentionDays` above 0, MINT deletes older events once a day and records the deletion as `audit.purge`. See [Configuration](/admin/configuration#audit).

### Audit log and feedback

Signed-in users can send feedback (a bug, an idea or other) from **Send feedback** in the account menu. Each submission is one `feedback.submit` audit event. It holds the text, the page path, the user agent and the platform version. A user can send 10 per hour. The retention purge keeps these events. There is no viewer in the UI. Administrators read the feedback with `mint platform admin feedback`, or with `GET /api/admin/audit?action=feedback.`.

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

| Key | Notes |
|-----|-------|
| `id` | Unique, non-empty |
| `path` | Absolute path on the server. Never sent to browsers; users see only the id and label. |
| `label` | Display name; defaults to the id |

The file browser routes exist only when at least one mount is configured, and a user needs `filesystem.browse` (included in Admin and Member). When authentication is disabled, browsing stays closed unless `filesystem.allowUnauthenticated` is `true`. A mount that is offline shows as unavailable instead of blocking startup. Restart MINT after changing mounts.

## Next

→ [Users & roles](/admin/users-roles)
→ [Plugins](/admin/plugins)
→ [Updates](/admin/updates)
