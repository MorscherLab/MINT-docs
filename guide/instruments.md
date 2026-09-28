# Instruments

The **Instruments** page is the lab's shared directory of equipment: mass spectrometers, LC systems, and anything else plugins and people refer to. Each instrument is listed once for the whole platform, so every plugin uses the same names.

> [Screenshot: Instruments page with the instrument directory as a grid of resource cards]

## Open the directory

1. On **Home**, click **Instruments** in the top navigation (or go to `/instruments`).
2. Search by name, type, or location, or switch on **Show inactive** to include retired equipment.
3. Click a card or its **Details** button to see the full record.

Each card shows the instrument's name, description, location, status (**Active** or **Inactive**), type, manufacturer, model, serial number, and the kinds of its components as tags.

The details view adds the instrument ID and the list of **Components**: optional parts of a system, such as the pump, autosampler, and column of an LC-MS setup, each with its own kind, name, manufacturer, model, and serial number.

> [Screenshot: instrument details modal showing fields and the Components list]

## Who can see and change instruments

| Permission | Allows |
|------------|--------|
| `instruments.view` | Open the Instruments page and view every instrument |
| `instruments.edit` | Add instruments and edit existing ones |

All built-in roles can view instruments; by default only Admins can edit them. See [Permissions](/reference/permissions) for the full list, and ask your admin if you need edit access.

## Add or edit an instrument

With `instruments.edit`:

1. Click **New instrument**, or open an instrument's details and click **Edit instrument**.
2. Enter a **Name** (required) and any of **Type**, **Manufacturer**, **Model**, **Serial number**, **Location**, and **Description**.
3. Optional: click **Add component** for each part of the system. Every component needs a **Kind** (for example `pump` or `column`).
4. Click **Save instrument**.

## Retire an instrument

Instruments cannot be deleted, because experiments and plugins may still refer to them. To retire one, edit it, switch off **Active**, and save. It disappears from the default list but stays available under **Show inactive**, and you can switch it back on at any time.

## Reservations and scheduling

The Instruments page only describes equipment. Booking instrument time and planning runs happen in the **MS Planner** plugin.
