# First-run setup

This page tells you how to finish the setup in the browser. First, install MINT ([direct](/admin/install-direct) or [Docker](/admin/install-docker)) and put a [reverse proxy](/admin/reverse-proxy) in front of it.

## Run the setup wizard

Open the public URL in your browser. Until the setup is complete (`setupCompleted` in `config.json`), MINT shows the **Setup** wizard:

1. **Database.** Enter the PostgreSQL host, port, database name, user and password. Click **Test connection**. The wizard saves the values to `config.json`: the `database` block, `DB_USERNAME` and `DB_PASSWORD`.
2. **Administrator.** Enter a username (at least 3 characters) and a password. The wizard shows the [password rules](/admin/authentication#accounts-and-registration).
3. **Restart.** MINT creates the admin account and asks for a restart before the first login.

> [Screenshot: setup wizard on the Administrator step, with the password rules checklist]

A database field that an environment variable or `.env` sets is read-only and shows the variable name. These variables are `MINT_DATABASE__HOST`, `__PORT`, `__DATABASENAME`, `MINT_DB_USERNAME` and `MINT_DB_PASSWORD`. Docker Compose always sets them. **Test connection** uses the configured value, and the wizard does not write it to `config.json`. A password from the environment needs a host and a port from the environment.

The wizard keeps the admin password in `config.json` only during the setup and clears it at the end. You cannot run the wizard again after the setup is complete.

## After the setup

1. Decide whether people can create their own accounts. Self-registration is on by default. See [Accounts and registration](/admin/authentication#accounts-and-registration).
2. Create the experiment types in **Admin -> Lab content**. See [Experiment types](/admin/platform-settings#experiment-types).
3. Configure notifications in **Admin -> System**. See [Notifications](/admin/platform-settings#notifications).
4. Create accounts with `mint platform admin user create`, or let people register. Then assign system roles. See [Users & roles](/admin/users-roles).
5. Create the first project. See [Projects](/guide/projects).

The marketplace registry URL is `marketplace.registryUrl` in `config.json`; see [`marketplace`](/admin/configuration#marketplace).
