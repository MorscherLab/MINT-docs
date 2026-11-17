# First-run setup

Install MINT ([direct](/admin/install-direct) or [Docker](/admin/install-docker)) and put a [reverse proxy](/admin/reverse-proxy) in front of it. Then finish setup in the browser.

Open the public URL in your browser. Until setup completes (`setupCompleted` in `config.json`), MINT shows the **Setup** wizard:

1. **Database** — PostgreSQL host, port, database name, user, and password. **Test connection** checks them. The wizard saves these values to `config.json`, replacing the `database` block and `DB_USERNAME` / `DB_PASSWORD`. A field that an environment variable or `.env` sets (`MINT_DATABASE__HOST`, `__PORT`, `__DATABASENAME`, `MINT_DB_USERNAME`, `MINT_DB_PASSWORD`; always the case under Docker Compose) is read-only and shows the variable name. **Test connection** uses the configured value, and the wizard does not write it to `config.json`. An environment-set password needs an environment-set host and port.
2. **Administrator** — username (at least 3 characters) and password (at least 8 characters, at most 72 bytes when UTF-8 encoded).
3. **Restart** — MINT creates the admin account and asks for a restart before first login.

> [Screenshot: setup wizard on the administrator step with the password requirements checklist]

The wizard keeps the admin password in `config.json` only while setup is in progress and clears it once setup completes. Once setup completes, the wizard cannot be run again.

After setup:

1. Decide whether people may create their own accounts. Self-registration is on by default (`auth.allowRegistration`); new accounts get the default role, Member, and stay inactive until an administrator activates them. See [Authentication](/admin/authentication#accounts-and-registration).
2. Create experiment types and configure notifications from **Admin -> Platform** (see [Platform settings](/admin/platform-settings)). The marketplace registry URL is set with `marketplace.registryUrl` in `config.json`.
3. Create accounts with `mint platform admin user create`, or let people register, then assign system roles (see [Users & roles](/admin/users-roles)).
4. Create your first **Project** (see [Projects](/guide/projects)).
