# Report instrument status

Show the live state of an instrument on the Instruments page and in [`mint platform instruments`](/sdk/api/cli-reference#mint-platform-instruments). An instrument daemon sends reports to your plugin, and the plugin forwards them to the platform.

The platform keeps only the latest report of each instrument, in memory, and adds history rows from the reports. It keeps no alerts: keep alerts and plugin logs in the plugin. For what users see, see [Where live status comes from](/guide/instruments#where-live-status-comes-from).

## Set up access

1. Declare `features = {"instrument_status"}` in the plugin `Metadata`.
2. Ask an administrator with `instruments.edit` to grant the plugin **Instrument status** for each instrument. The plugin can report only for these instruments.
3. Ask an administrator to issue a service token (`mint_svc_...`) for the plugin. See [Service tokens](/admin/authentication#service-tokens).
4. Configure the daemon to send the token as a Bearer credential to your plugin route.

## Write the route

A service token names no user. Mount the route with `auth=False` and read the caller with `CurrentServiceCaller`. This dependency answers 401 for every other kind of caller. Check `caller.instrument_ids`, then call `context.instruments.report`.

```python
from fastapi import HTTPException
from pydantic import BaseModel

from mint_sdk import CurrentServiceCaller, Metadata, Plugin, endpoint, plugin
from mint_sdk.instruments import InstrumentLiveStatus, InstrumentStatus
from mint_sdk.instruments import InstrumentAlerts


class StatusReport(BaseModel):
    status: InstrumentStatus
    alerts: InstrumentAlerts = "none"   # "none" | "open" | "critical"


class LabMonitor(Metadata):
    domain = "monitoring"
    title = "Lab monitor"
    prefix = "/lab-monitor"
    features = {"instrument_status"}


@plugin(LabMonitor)
class LabMonitorPlugin(Plugin):
    @endpoint.post("/instruments/status", auth=False)
    async def report_status(
        self, report: StatusReport, caller: CurrentServiceCaller
    ) -> InstrumentLiveStatus:
        if report.status.instrument_id not in caller.instrument_ids:
            raise HTTPException(403, "The token is not bound to this instrument")
        return await self.context.instruments.report(report.status, alerts=report.alerts)
```

`report` replaces the platform snapshot for `status.instrument_id` and returns the new `InstrumentLiveStatus`. The plugin grant, not the caller, scopes the call. Send a report at least every 60 seconds. After 60 seconds without a report, the instrument reads as `disconnected`.

| Error | Cause |
|-------|-------|
| `NotFoundException` | The instrument does not exist |
| `ConflictException` | The instrument is deactivated |
| `PermissionException` | The plugin has no grant for the instrument |

In standalone mode, `self.context.instruments` raises `UnavailableException` (HTTP 503). The SDK host maps the typed exceptions to HTTP errors; see [Error handling](/sdk/recipes/error-handling).

## Add panels and finished samples (optional)

All models are in `mint_sdk.instruments`.

- `InstrumentStatus.panels` shows up to 8 panels on the instrument page: `KeyValuePanel`, `TablePanel`, `TextPanel`, `JsonPanel` or `BarPanel`. The panels of one report must not exceed 16 KiB.
- To add a history row for a finished injection, set `completed_sample` in that report. A `CompletedSample` has the sample fields plus `position`, `metrics` (up to 4 `InjectionMetric`), `panels` and `completed_at`.
- To add late metrics, send the same sample again (same `file_name`, `position` and `started_at`). This replaces the metrics and adds no row.
- In the report that ends a sequence, set `sequence_completed=True`.

## Serve alerts (optional)

1. Add `"instrument_alerts"` to `features`. The platform then shows an alerts card for the instruments of the plugin.
2. Mount `instrument_alerts_router(list_fn, ack_fn)` with the sub-prefix `""`. The router serves `GET /instruments/{instrument_id}/alerts?since=` and `POST /instruments/{instrument_id}/alerts/{alert_id}/ack`.

Import `InstrumentAlert` and `InstrumentAlertList` from `mint_sdk.instrument_alerts`. They differ from `mint_sdk.instruments.InstrumentAlert`.

```python
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request

from mint_sdk.instrument_alerts import InstrumentAlert, instrument_alerts_router


# Add these members to LabMonitorPlugin and set
# features = {"instrument_status", "instrument_alerts"} in LabMonitor.
class LabMonitorPlugin(Plugin):
    alerts: dict[str, list[InstrumentAlert]] = {}

    def routers(self) -> list[tuple[APIRouter, str]]:
        return [(instrument_alerts_router(self.list_alerts, self.ack_alert), "")]

    def list_alerts(
        self, instrument_id: str, since: datetime | None
    ) -> list[InstrumentAlert]:
        found = self.alerts.get(instrument_id, [])
        return [a for a in found if since is None or a.timestamp >= since]

    async def ack_alert(
        self, instrument_id: str, alert_id: str, request: Request
    ) -> InstrumentAlert:
        found = self.alerts.get(instrument_id, [])
        for index, alert in enumerate(found):
            if alert.id == alert_id:
                found[index] = alert.model_copy(update={
                    "acknowledged": True,
                    "acknowledged_by": "platform user",
                    "acknowledged_at": datetime.now(UTC),
                })
                return found[index]
        raise HTTPException(404, "Alert not found")
```

- `list_fn(instrument_id, since)` returns the alerts, newest first.
- `ack_fn(instrument_id, alert_id, request)` acknowledges one alert. It returns the alert with `acknowledged_by` and `acknowledged_at` set.
- Each function can be sync or async.
- The plugin decides who may acknowledge. The platform has already checked `plugins.use` and plugin visibility. To name the user, resolve the caller from the `Authorization` credential of the request.
- To refuse, raise `PermissionException` (HTTP 403). The platform page then reverts its update.
- For an unknown instrument or alert, raise `NotFoundException` or `HTTPException(404)`.

Pass `alerts="open"` or `alerts="critical"` to `report`. The platform stores only the two flags that it derives from this value.

### Send the time of the newest critical alert

Set `latest_critical_at` on the report to the time of the newest unacknowledged critical alert. The platform then reads the instrument as critical only while that time is inside the alert window; see [Alerts and the alert window](/guide/instruments#alerts-and-the-alert-window). A report without `latest_critical_at` keeps its critical flag.

```python
return await self.context.instruments.report(
    report.status,
    alerts="critical",
    latest_critical_at=newest_unacknowledged_critical.timestamp,
)
```

The live status has the matching fields `latest_critical_at` and `alerts_since` (the start of the window). The alerts card asks your route for the alerts of the window with the `since` query. Use `alerts_since` to list the same window.

## Pitfalls

- Do not store your own API key for daemons. Use platform service tokens.
- Do not use `CurrentActor` in the report route. It refuses a service token, because the token names no user.
- Check `caller.instrument_ids` yourself. The platform does not check the instrument in the request body.
- The platform refuses an unbound or revoked token with 401 or 403 before your route runs.

For the models, see [Python SDK reference → Instrument status](/sdk/api/python#instrument-status).
