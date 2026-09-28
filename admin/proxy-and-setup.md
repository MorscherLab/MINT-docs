# Reverse proxy and first-run setup

Both install paths bind MINT to `127.0.0.1:8001` on the host. Put a reverse proxy in front, then finish setup in the browser.

## Reverse proxy

::: code-group

```nginx [nginx]
# /etc/nginx/sites-available/mint
server {
    listen 443 ssl http2;
    server_name mint.example.org;

    ssl_certificate     /etc/letsencrypt/live/mint.example.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mint.example.org/privkey.pem;

    client_max_body_size 1G;

    location / {
        proxy_pass         http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
```

```text [Caddy]
mint.example.org {
    reverse_proxy 127.0.0.1:8001
    request_body {
        max_size 1GB
    }
}
```

:::

Caddy auto-issues TLS certificates; nginx pairs naturally with `certbot`. Either way, forward `X-Forwarded-For` so MINT's rate limiter and audit log see real client IPs.

MINT believes forwarded headers only from proxies listed in `server.trustedProxyCidrs`. The default is `["127.0.0.1/32", "::1/128"]`. If your proxy is not on local loopback, add only its address or CIDR. An explicitly empty list (`[]`) trusts no proxy at all. The same list decides whether MINT honours `X-Forwarded-Host` when it builds the passkey relying-party ID and origin, so either set `server.rpId` or make sure the proxy is trusted.

Set `server.externalUrl` to the public `https://` URL. MINT then marks its login cookies `Secure` even though the proxy talks plain HTTP to it.

## First-run setup

Open the public URL in your browser. Until setup completes (`setupCompleted` in `config.json`), MINT shows the **Setup** wizard:

1. **Database** — PostgreSQL host, port, database name, user, and password. **Test connection** checks them. The wizard saves these values to `config.json`, replacing the `database` block and `DB_USERNAME` / `DB_PASSWORD`.
2. **Administrator** — username (at least 3 characters) and password (at least 8 characters).
3. **Restart** — MINT creates the admin account and asks for a restart before first login.

> [Screenshot: setup wizard on the administrator step with the password requirements checklist]

The wizard keeps the admin password in `config.json` only while setup is in progress and clears it once setup completes. Once setup completes, the wizard cannot be run again.

After setup:

1. Decide whether people may create their own accounts. Self-registration is on by default (`auth.allowRegistration`); new accounts get the default role, Member. See [Authentication](/admin/authentication#accounts-and-registration).
2. Create experiment types and configure notifications from **Admin -> Platform** (see [Platform settings](/admin/platform-settings)). The marketplace registry URL is set with `marketplace.registryUrl` in `config.json`.
3. Create accounts with `mint admin user create`, or let people register, then assign system roles (see [Users & roles](/admin/users-roles)).
4. Create your first **Project** (see [Projects](/guide/projects)).
