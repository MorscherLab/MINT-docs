# Report instrument status

## Goal

Show the live state of an instrument (state, current sample, sequence progress, alerts) on the platform's Instruments page and in `mint platform instruments`. An instrument daemon sends reports to your plugin. Your plugin forwards them to the platform.

The platform keeps only the latest snapshot for each instrument, in memory. A platform restart empties the snapshots. From each report the platform also adds rows to its instrument history (`instrument_status_events`): a state change, a finished sample, a finished sequence and a disconnect. An instrument reads as `disconnected` when its last report is older than 60 seconds. The platform keeps no alert records. Keep alerts and plugin-specific logs in the plugin.

## Set up access

1. Declare `features = {"instrument_status"}` in the plugin `Metadata`.
2. An administrator with `instruments.edit` opens the plugin's access settings and selects the instruments in the **Instrument status** block. The plugin can report only for these instruments.
3. An administrator issues a service token (`mint_svc_...`) for the plugin under **Admin → Service Tokens**. See [Service tokens](/admin/authentication#service-tokens). The token can name only instruments in the plugin's grant.
4. Configure the instrument daemon to send the token as a Bearer credential to your plugin route.

## Write the route

A service token names no user. Mount the route with `auth=False`. Read the caller with `CurrentServiceCaller`. The dependency answers 401 for every other kind of caller. Check `caller.instrument_ids` before you report, then call `context.instruments.report`.

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

`report` replaces the platform snapshot for `status.instrument_id` and returns the new `InstrumentLiveStatus`. The grant, not the caller, scopes the call. Send a report at an interval shorter than 60 seconds, so that the instrument stays connected.

| Error | Cause |
|-------|-------|
| `NotFoundException` | The instrument does not exist |
| `ConflictException` | The instrument is deactivated |
| `PermissionException` | The plugin has no grant for the instrument |

Standalone, `self.context.instruments` raises `UnavailableException` (HTTP 503). The SDK host maps the typed exceptions to HTTP errors. See [Error handling](/sdk/recipes/error-handling).

## Add panels and finished samples (optional)

`InstrumentStatus.panels` shows up to 8 typed panels (`KeyValuePanel`, `TablePanel`, `TextPanel`, `JsonPanel`, `BarPanel`) on the instrument page. The panels of one report may not exceed 16 KiB. In the report that finishes an injection, set `completed_sample` (`CompletedSample`: the sample fields plus `position`, `metrics` with up to 4 `InjectionMetric`, `panels` and `completed_at`) to add a row to the instrument history. Send the same sample again (same `file_name`, `position` and `started_at`) to add late metrics. It replaces the metrics and adds no row. Set `sequence_completed=True` in the report that ends a sequence. All models are in `mint_sdk.instruments`.

## Serve alerts (optional)

The platform shows an alerts card for an instrument when the reporting plugin declares `"instrument_alerts"` in `features`. Declare `"instrument_alerts"` in `features` and mount `instrument_alerts_router(list_fn, ack_fn)` with the sub-prefix `""`. The router serves `GET /instruments/{instrument_id}/alerts?since=` and `POST /instruments/{instrument_id}/alerts/{alert_id}/ack`.

`mint_sdk.instrument_alerts` has its own `InstrumentAlert` and `InstrumentAlertList`. They differ from `mint_sdk.instruments.InstrumentAlert`. Import them from the module.

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

`list_fn(instrument_id, since)` returns the alerts, newest first. `ack_fn(instrument_id, alert_id, request)` acknowledges one alert and returns it with `acknowledged_by` and `acknowledged_at` set. Either function can be sync or async. The plugin decides who may acknowledge: the platform has already checked `plugins.use` and plugin visibility. To name the user, resolve the caller from the `Authorization` credential of the request. Raise `PermissionException` (HTTP 403) to refuse; the platform page then reverts its update. Raise `NotFoundException` or `HTTPException(404)` for an unknown instrument or alert.

Pass `alerts="open"` or `alerts="critical"` to `report`. The platform stores only the two flags that it derives from this value.

## Pitfalls

- Do not store your own API key for daemons. Use platform service tokens.
- Do not rely on `CurrentActor` in the report route. A service token names no user, so that dependency refuses it.
- Check `caller.instrument_ids` yourself. The platform does not check the instrument in the request body.
- An unbound or revoked token fails at the platform with 401 or 403 before your route runs.

## Related

- [Python SDK reference → Instrument live status](/sdk/api/python#instrument-status)
- [Route permissions](/sdk/recipes/route-permissions)
- [`mint platform instruments`](/sdk/api/cli-reference#mint-platform-instruments)
