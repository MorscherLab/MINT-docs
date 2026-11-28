# Instruments

The **Instruments** page shows the live status of the lab's shared equipment, such as mass spectrometers and LC systems. Each instrument has one record for the whole platform, so all plugins use the same names.

> [Screenshot: Instruments page in Table view with filter chips and grouped rows]

## Navigate to instruments

**Instruments** in the pill navigation shows when you have `instruments.view`, or when the server has authentication off. A red dot on it means that an active instrument has a critical alert that nobody acknowledged.

> [Screenshot: pill navigation with the red dot on Instruments]

## Check the live status

1. Click **Instruments** in the pill navigation, or go to `/instruments`.
2. Click a filter chip to narrow the list. Each chip shows a count: **All**, **Needs attention**, **Running**, **Available**, and **Not reporting**.
3. Optional: type a name, type or location in the search box.
4. Optional: switch on **Show inactive** to add retired instruments under an **Inactive** group.

The page groups the instruments in this order: **Needs attention** (errors and offline instruments), **Running**, **Available**, **Not reporting yet**, and **Inactive**. Running instruments are sorted by ETA.

In **Table** view, each row shows the state, the instrument, the current run, the progress, the ETA and the last report. In **Cards** view, each instrument is a tile with the same data. Use the **Table** and **Cards** buttons to switch. Your browser keeps your choice.

The page refreshes by itself every 15 seconds.

When there are no instruments, the page shows **No instruments yet**. Users with `instruments.edit` see **New instrument**. Other users see a note to ask an instrument editor.

> [Screenshot: Instruments page in Cards view]

## Open one instrument

Click a row or a tile to open the instrument page (`/instruments/<id>`). You need `instruments.view`.

| Area | Contents |
|------|----------|
| Header | Name, state, and a note such as the time since the state began. A link to the plugin that reports for the instrument, when there is one. |
| Current run | Injection (for example `12 / 48`), elapsed time, remaining time, ETA, and average time per injection. Also a progress bar, a strip with the time of each injection, and the current sample, raw file, method, and sequence. When the plugin reports a metric for each injection, such as the maximum pressure, a switch under the strip changes the bars from **Time** to that metric. Point at a bar to see its injection and value. |
| Live data | The extra panels that the reporting plugin shows: key-value lists, tables, text, JSON, and bar charts, one tab for each panel. Shown only when the plugin reports panels. |
| Alerts | The alerts of the alert window (72 hours by default) from the reporting plugin. Shown only when that plugin serves alerts. See [Alerts and the alert window](#alerts-and-the-alert-window). |
| History | The recorded status changes and finished samples. See [History](#history). |
| Details, Components, Reporting | The instrument record, its parts, and the source and time of the last report. |

If an instrument has no run, the card tells you why: no reports yet, inactive, standby, idle, error, or not reporting.

To acknowledge an alert, click **Acknowledge** next to it. The reporting plugin decides whether you may do this.

### Alerts and the alert window

An instrument shows as critical only while its newest unacknowledged critical alert is inside the alert window. The default window is 72 hours. When the alert is older than the window, the instrument is no longer critical and the red dot on **Instruments** goes away. The **Alerts** card lists the alerts of the same window. Older alerts stay in the reporting plugin. Your admin sets the window or turns it off; see [Configuration](/admin/configuration#instruments).

> [Screenshot: instrument page with the current run card, the time-per-injection strip, and the Alerts card]

## History

MINT records a history row each time an instrument changes state, finishes a sample, finishes a sequence, or stops reporting. The **History** card on the instrument page lists the rows, newest first.

| Column | Contents |
|--------|----------|
| Time | When the sample finished, or else when MINT received the report |
| Event | A state change such as `idle → running`, `sample done`, `sequence done`, or `disconnected` |
| Sample | The sample file, for a finished sample |
| Experiment | A link to the experiment, when the plugin linked it and you may see it |
| Metric columns | One column for each metric of the finished samples, such as the maximum pressure |

Click a row to see the status snapshot of that moment. Click **Load more** for older rows. Click **Export CSV** to download the rows, including the start and end time of each finished sample.

The experiment page shows the rows that name the experiment under **Instrument records**. You need `instruments.view`. A row whose experiment you cannot see does not show the experiment.

By default MINT keeps every row. Your admin can set a retention period; MINT then deletes older rows once a day.

## Where live status comes from

A plugin reports the status. An administrator must first grant that plugin **Instrument status** for each instrument, in the plugin's access control. See [Plugins](/admin/plugins).

MINT keeps the latest report for each instrument in memory. A restart of the platform clears it, and the instrument shows **No reports yet** until the next report. An instrument shows as **Offline**, under **Needs attention**, 60 seconds after its last report. The history is stored in the database and survives a restart.

## Who can see and change instruments

| Permission | Allows |
|------------|--------|
| `instruments.view` | Open the Instruments page and the instrument pages |
| `instruments.edit` | Add instruments, edit them, and archive or restore them |

All built-in roles can view instruments. By default, only Admins can edit them. If you need edit access, ask your admin. See [Permissions](/reference/permissions).

## Add or edit an instrument

With `instruments.edit`:

1. Click **New instrument** on the Instruments page. To change an instrument, open it and click **Edit details**.
2. In **Identity**, enter a **Name** (required). Optional: enter **Type**, **Location**, and **Description**.
3. In **Hardware**, optional: enter **Manufacturer**, **Model**, and **Serial number**.
4. In **Components**, optional: click **Add component** for each part of the system, such as the pump, autosampler, or column. Every component needs a **Kind**. Optional: add its name, manufacturer, model, and serial number.
5. Click **Save instrument**.

## Archive an instrument

MINT never deletes an instrument, because experiments and plugins can refer to it.

1. Open the instrument.
2. Click **Archive**.

The instrument leaves the default list and the Home card. It stays under **Show inactive**. To bring it back, click **Restore**. The **Active** switch in the edit window does the same.

## Instruments on Home

The **Instruments** card on [Home](/guide/ui-tour#home-dashboard) lists errors and offline instruments first, then running instruments by ETA. It shows at most five rows, but always every instrument that needs attention. A line such as **3 more** counts the rest. Click a row to open that instrument, or **All** to open the Instruments page.

> [Screenshot: Home with the Instruments card at the top of the left column]

## Push notifications

People with `instruments.view` get a push message on the MINT iOS app when a sequence finishes or an instrument changes to **error**. See [Notifications and iOS push](/guide/notifications).

## Reservations and scheduling

To book instrument time and plan runs, use the **MS Planner** plugin.
