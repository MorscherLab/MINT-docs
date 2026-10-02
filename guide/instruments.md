# Instruments

The **Instruments** page shows the live status of the lab's shared equipment: mass spectrometers, LC systems, and anything else plugins and people refer to. Each instrument is listed once for the whole platform, so every plugin uses the same names.

> [Screenshot: Instruments page in List view with filter chips and grouped rows]

## Navigate to instruments

Every platform page has the same pill navigation: **Home**, **Experiments** (a menu with **Experiments** and **Projects**), and **Instruments**.

**Instruments** shows when you have `instruments.view` (or when the server has authentication off). A red dot on it means an active instrument has a critical alert that nobody has acknowledged.

> [Screenshot: pill navigation with the red dot on Instruments]

## Check the live status

1. Click **Instruments** in the pill navigation (or go to `/instruments`).
2. Click a filter chip to narrow the list. Each chip shows a count: **All**, **Needs attention**, **Running**, **Available**, and **Not reporting**.
3. Optional: type in the search box to match a name, type, or location.
4. Optional: switch on **Show inactive** to add retired instruments under an **Inactive** group.

The page groups the instruments in this order: **Needs attention** (errors and offline instruments), **Running**, **Available**, **Not reporting yet**, and **Inactive**. Running instruments are sorted by their ETA.

In **List** view, each row shows the state, the instrument, its current run, the progress, the ETA, and the last report. In **Board** view, each instrument is a tile with the same data. Use the **List** and **Board** buttons to switch. Your browser remembers your choice.

The page refreshes by itself every 15 seconds.

If the directory is empty, the page shows **No instruments yet**. Users with `instruments.edit` see a **New instrument** button. Other users see a note to ask an instrument editor to add equipment.

> [Screenshot: Instruments page in Board view]

## Open one instrument

Click a row or a tile to open the instrument page (`/instruments/<id>`). You need `instruments.view`.

| Area | Contents |
|------|----------|
| **Header** | Name, state, and a note such as the time since the state began. A link to the plugin that reports for the instrument, when there is one. |
| **Current run** | Injection (for example `12 / 48`), elapsed time, remaining time, ETA, and average time per injection. Also a progress bar, a strip with the time of each injection, and the current sample, raw file, method, and sequence. |
| **Alerts** | The alerts of the last 7 days from the reporting plugin. Shown only when that plugin serves alerts. |
| **Details**, **Components**, **Reporting** | The instrument record, its parts, and the source and time of the last report. |

If an instrument has no run, the card tells you why: no reports yet, inactive, standby, idle, error, or not reporting.

To acknowledge an alert, click **Acknowledge** next to it. The reporting plugin decides whether you may do this.

> [Screenshot: instrument page with the current run card, the time-per-injection strip, and the Alerts card]

## Where live status comes from

A plugin reports the status. An administrator must first grant that plugin **Instrument status** for each instrument, in the plugin's access control. See [Plugins](/admin/plugins).

MINT keeps only the latest report for each instrument, and only in memory. A restart of the platform clears it, and the instrument shows **No reports yet** until the next report. An instrument shows as **Offline**, under **Needs attention**, 60 seconds after its last report.

## Who can see and change instruments

| Permission | Allows |
|------------|--------|
| `instruments.view` | Open the Instruments page and the instrument pages |
| `instruments.edit` | Add instruments, edit them, and archive or restore them |

All built-in roles can view instruments; by default only Admins can edit them. See [Permissions](/reference/permissions) for the full list, and ask your admin if you need edit access.

## Add or edit an instrument

With `instruments.edit`:

1. Click **New instrument** on the Instruments page. To change an instrument, open it and click **Edit details**.
2. In **Identity**, enter a **Name** (required). Optional: enter **Type**, **Location**, and **Description**.
3. In **Hardware**, optional: enter **Manufacturer**, **Model**, and **Serial number**.
4. In **Components**, optional: click **Add component** for each part of the system, such as the pump, autosampler, or column. Every component needs a **Kind**. Optional: add its name, manufacturer, model, and serial number.
5. Click **Save instrument**.

## Archive an instrument

MINT never deletes an instrument, because experiments and plugins can still refer to it. To retire one, open it and click **Archive**. It leaves the default list and the Home card, and stays under **Show inactive**. Click **Restore** to bring it back.

The **Active** switch in the edit window does the same.

## Instruments on Home

With `instruments.view`, **Home** shows an **Instruments** card at the top of the left column when at least one instrument is active. The card lists errors and offline instruments first, then running instruments by ETA. It shows at most five rows, but always shows every instrument that needs attention. A line such as **3 more** counts the rest. Click a row to open that instrument, or click **All** to open the Instruments page.

> [Screenshot: Home with the Instruments card at the top of the left column]

## Reservations and scheduling

The Instruments pages show equipment and its status. Booking instrument time and planning runs happen in the **MS Planner** plugin.
