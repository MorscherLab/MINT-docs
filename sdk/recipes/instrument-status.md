# Report instrument status

## Goal

Show the live state of an instrument (state, current sample, sequence progress, alerts) on the platform's Instruments page and in `mint instruments`. An instrument daemon sends reports to your plugin. Your plugin forwards them to the platform.

The platform keeps only the latest snapshot for each instrument, in memory. It keeps no history and no alert records. A platform restart empties the snapshots. An instrument reads as `disconnected` when its last report is older than 60 seconds. Keep alerts and history in the plugin.

## Set up access

1. Declare `PluginCapabilities.instrument_status_write=True` in the plugin.
2. An administrator with `instruments.edit` and `instruments.view` opens the plugin's access settings and selects the instruments in the **Instrument status** block. The plugin can report only for these instruments.
3. An administrator issues a service token (`mint_svc_...`) for the plugin under **Admin → Service Tokens**. See [Service tokens](/admin/authentication#service-tokens). The token can name only instruments in the plugin's grant.
4. Configure the instrument daemon to send the token as a Bearer credential to your plugin route.

## Write the route

A service token names no user. Mount the route with `auth=False`. Read the caller with `CurrentServiceCaller`. The dependency answers 401 for every other kind of caller. Check `caller.instrument_ids` before you report, then call `report_status`.

```python
from fastapi import HTTPException
from pydantic import BaseModel

from mint_sdk import (
    AnalysisPlugin,
    CurrentServiceCaller,
    InstrumentLiveStatus,
    PluginCapabilities,
    endpoint,
    mint_plugin,
)
from mint_sdk.instrument import InstrumentStatus


class StatusReport(BaseModel):
    status: InstrumentStatus
    has_unacknowledged_alerts: bool = False
    has_unacknowledged_critical: bool = False


@mint_plugin(
    analysis_type="monitoring",
    routes_prefix="/lab-monitor",
    display_name="Lab monitor",
    capabilities=PluginCapabilities(instrument_status_write=True),
)
class LabMonitorPlugin(AnalysisPlugin):
    @endpoint.post("/instruments/status", auth=False)
    async def report_status(
        self, report: StatusReport, caller: CurrentServiceCaller
    ) -> InstrumentLiveStatus:
        if report.status.instrument_id not in caller.instrument_ids:
            raise HTTPException(403, "The token is not bound to this instrument")
        repository = self.context.get_instrument_repository() if self.context else None
        if repository is None:
            raise HTTPException(503, "Instrument status needs the MINT platform")
        try:
            return await repository.report_status(
                report.status,
                has_unacknowledged_alerts=report.has_unacknowledged_alerts,
                has_unacknowledged_critical=report.has_unacknowledged_critical,
            )
        except NotImplementedError:
            raise HTTPException(503, "The platform predates instrument status") from None
```

`report_status` replaces the platform snapshot for `status.instrument_id` and returns the new `InstrumentLiveStatus`. The grant, not the caller, scopes the call. Send a report at an interval shorter than 60 seconds, so that the instrument stays connected.

| Error | Cause |
|-------|-------|
| `NotFoundException` | The instrument does not exist |
| `ConflictException` | The instrument is deactivated |
| `PermissionException` | The plugin has no grant for the instrument |
| `NotImplementedError` | The platform predates 1.3 |

The SDK host maps the typed exceptions to HTTP errors. See [Error handling](/sdk/recipes/error-handling).

## Serve alerts (optional)

The platform shows an alerts card for an instrument when the reporting plugin declares `serves_instrument_alerts=True`. Declare it and mount `instrument_alerts_router(list_fn, ack_fn)` with the sub-prefix `""`. The router serves `GET /instruments/{instrument_id}/alerts?since=` and `POST /instruments/{instrument_id}/alerts/{alert_id}/ack`.

`mint_sdk.instrument_alerts` has its own `InstrumentAlert` and `InstrumentAlertList`. They differ from `mint_sdk.instrument.InstrumentAlert`. Import them from the module.

```python
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request

from mint_sdk import PermissionException
from mint_sdk.instrument_alerts import InstrumentAlert, instrument_alerts_router


# Add these members to LabMonitorPlugin and declare
# PluginCapabilities(instrument_status_write=True, serves_instrument_alerts=True).
class LabMonitorPlugin(AnalysisPlugin):
    alerts: dict[str, list[InstrumentAlert]] = {}

    def get_routers(self) -> list[tuple[APIRouter, str]]:
        return [(instrument_alerts_router(self.list_alerts, self.ack_alert), "")]

    def list_alerts(
        self, instrument_id: str, since: datetime | None
    ) -> list[InstrumentAlert]:
        found = self.alerts.get(instrument_id, [])
        return [a for a in found if since is None or a.timestamp >= since]

    async def ack_alert(
        self, instrument_id: str, alert_id: str, request: Request
    ) -> InstrumentAlert:
        actor = await self.context.resolve_plugin_actor(request)
        if not actor.has_permission("instruments.edit"):
            raise PermissionException("Acknowledging needs instruments.edit")
        found = self.alerts.get(instrument_id, [])
        for index, alert in enumerate(found):
            if alert.id == alert_id:
                found[index] = alert.model_copy(update={
                    "acknowledged": True,
                    "acknowledged_by": actor.username,
                    "acknowledged_at": datetime.now(UTC),
                })
                return found[index]
        raise HTTPException(404, "Alert not found")
```

`list_fn(instrument_id, since)` returns the alerts, newest first. `ack_fn(instrument_id, alert_id, request)` acknowledges one alert and returns it with `acknowledged_by` and `acknowledged_at` set. Either function can be sync or async. The plugin decides who may acknowledge. Raise `PermissionException` (HTTP 403) to refuse; the platform page then reverts its update. Raise `NotFoundException` or `HTTPException(404)` for an unknown instrument or alert.

Pass `has_unacknowledged_alerts` and `has_unacknowledged_critical` to `report_status`. The platform stores only these two flags.

## Pitfalls

- Do not store your own API key for daemons. Use platform service tokens.
- Do not rely on `CurrentPluginActor` in the report route. A service token names no user, so that dependency refuses it.
- Check `caller.instrument_ids` yourself. The platform does not check the instrument in the request body.
- An unbound or revoked token fails at the platform with 401 or 403 before your route runs.

## Related

- [Python SDK reference → Instrument live status](/sdk/api/python#instrument-live-status)
- [Route permissions](/sdk/recipes/route-permissions)
- [`mint instruments`](/sdk/api/cli-reference#mint-instruments)
