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

Caddy auto-issues TLS certificates; nginx pairs naturally with `certbot`. Either way, make sure `X-Forwarded-For` is forwarded so MINT's rate limiter sees real client IPs. MINT trusts forwarded headers only from `127.0.0.1/32` and `::1/128` by default; if your proxy is not local loopback, add only its address or CIDR to `server.trustedProxyCidrs`.

## First-run setup

Open the public URL in your browser. On a fresh install you'll see the **Setup** page (only shown when no admin exists). Create the first admin account; everything else is configured from the in-app **Admin** view.

> [Screenshot: setup page showing the first-admin form]

After setup:

1. Configure notification delivery and the marketplace registry from **Admin -> Platform -> Configuration** and **Admin -> Plugins -> Registry**
2. Create your first **Project** (see [Projects](/guide/projects))
3. Invite team members and assign system roles (see [Members & roles](/admin/users-roles))
