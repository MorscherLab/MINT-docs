# Platform settings

The **Admin -> Platform** group holds the lab-wide settings that are not tied to one plugin. Each section appears only to users with the permission shown.

| Section | Permission | Use it to |
|---------|------------|-----------|
| **Experiment Types** | `platform.configure` | Create and edit the types users pick for new experiments |
| **Notices** | `notices.publish` | Post announcements to the home page notice board |
| **Configuration** | `platform.configure` | Edit platform settings, including notification delivery |
| **Server** | `platform.configure` | Check versions, database, caches, and plugin processes |
| **Terminal** | `platform.configure` | Run commands in the server environment (off by default; see [Docker install](/admin/install-docker#optional-admin-terminal)) |
| **Logs** | `platform.view_logs` | Read and filter the platform log |

> [Screenshot: Admin navigation rail with the People, Plugins, and Platform groups expanded]

## Experiment types

Experiment types are the only source of the **Type** list in the new-experiment form. Plugins do not create them. Create a type before users need it.

Open **Admin -> Platform -> Experiment Types** and add a type:

| Field | Rules |
|-------|-------|
| **Value** | Slug used in codes and URLs: lowercase letters, digits, and underscores, starting with a letter, up to 50 characters. Cannot be changed later. |
| **Label** | Display name, up to 100 characters |
| **Description** | Optional |
| **Color** | Optional `#RRGGBB` |
| **Sort order** | Lower numbers appear first |
| **Active** | Inactive types are hidden from the new-experiment form |

> [Screenshot: Experiment Types section with the add-type form]

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

Each channel has a test action. The deliveries table lists recent sends by channel, plugin, event, and attempts, and failed deliveries can be retried.

Email for important events goes to the event's owner and to every active user whose role has `notifications.receive_important`.

> [Screenshot: notification settings with SMTP enabled and the deliveries table]

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

Set the bearer token with `server.healthReadyToken` (`MINT_SERVER__HEALTH_READY_TOKEN`) so an external monitor can read the readiness report without a user account. The Docker image's `HEALTHCHECK` probes `/api/health`.

## Logs and audit log

**Admin -> Platform -> Logs** (`platform.view_logs`) shows the platform log, including tracebacks from plugin jobs. Users with `platform.configure` set the log level in **Configuration**. File logging is set with `logging.fileEnabled` and `logging.filePath`.

MINT also keeps an audit log in the database: sign-ins (`auth.login_success`, `auth.login_failure`), registrations, and changes to projects, experiments, experiment types, notices, and plugins. There is no audit page in the UI yet. Read it with the API, using a token from a user with `platform.view_logs`:

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
