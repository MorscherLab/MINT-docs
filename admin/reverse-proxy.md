# Reverse proxy

This page tells you how to put a reverse proxy in front of MINT. MINT serves plain HTTP and does not terminate TLS, so every production install needs a proxy. The proxy must:

- Terminate TLS for the public `https://` URL.
- Send the client address and scheme in `X-Forwarded-*` headers.
- Pass long-lived streams (server-sent events and one WebSocket) without buffering.
- Accept large request bodies (plugin bundles, data uploads).

Both install methods bind MINT to `127.0.0.1:8001` on the host: the [direct install](/admin/install-direct) with `mint-platform serve --host 127.0.0.1 --port 8001`, the [Docker install](/admin/install-docker) with `MINT_PORT=127.0.0.1:8001`. The examples use that address and the public name `mint.example.org`.

## Proxy configuration

::: code-group

```nginx [nginx]
# /etc/nginx/sites-available/mint
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name mint.example.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
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
        proxy_set_header   X-Forwarded-Host  $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        $connection_upgrade;
        proxy_read_timeout 300s;
    }
}
```

```text [Caddy]
mint.example.org {
    request_body {
        max_size 1GB
    }
    reverse_proxy 127.0.0.1:8001
}
```

:::

Caddy gets TLS certificates, redirects HTTP to HTTPS, sets the `X-Forwarded-*` headers, passes WebSocket upgrades and streams responses without more configuration.

For nginx, do these steps:

1. Get a certificate with `certbot --nginx -d mint.example.org`.
2. Enable and test the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/mint /etc/nginx/sites-enabled/mint
   sudo nginx -t && sudo systemctl reload nginx
   ```

For a Caddy container in the same Compose project, see [Install on Linux (Docker)](/admin/install-docker#reverse-proxy). That proxy targets `app:8000`, not `127.0.0.1:8001`.

## Public URL

Set `server.externalUrl` in `config.json` to the public URL, with `https://` and no path:

```json
{
  "server": {
    "externalUrl": "https://mint.example.org"
  }
}
```

MINT uses this value as follows:

- The `mint_access_token` and `passkey_session` cookies get the `Secure` flag, although the proxy talks plain HTTP to MINT.
- MINT enforces the [second factor](/admin/authentication#second-factor) with passkeys only when `externalUrl` starts with `https://`.
- The `mint` CLI sign-in page is `<externalUrl>/device`.
- Calendar feed URLs and the platform origin that plugin pages receive use this value.
- `/mcp` accepts this host. See [Security settings](/admin/configuration#security-settings).

When `externalUrl` is empty, MINT builds these URLs from the `X-Forwarded-Host` and `X-Forwarded-Proto` headers of a trusted proxy. Otherwise it uses the request that it received. Cookies then carry `Secure` only when the request arrived over HTTPS.

If `externalUrl` starts with `https://` but users open MINT over plain HTTP, the browser drops the cookie and the login fails.

Passkeys use `server.rpId` as the relying-party ID. Decide on the host name before users register passkeys. See [Sign in with a passkey](/admin/authentication#sign-in-with-a-passkey).

## Trusted proxies

MINT reads the `X-Forwarded-*` headers only from a trusted proxy. Two settings control this trust. Give both the same proxy addresses:

| Setting | Read by | Default | Controls |
|---|---|---|---|
| `server.trustedProxyCidrs` (`config.json`) or `MINT_SERVER__TRUSTED_PROXY_CIDRS` | MINT | `["127.0.0.1/32", "::1/128"]` | The client IP for the rate limiter and the [audit log](/admin/platform-settings#logs-and-audit-log), the passkey host from `X-Forwarded-Host`, and the `platformOrigin` that plugin frontends receive |
| `mint-platform serve --forwarded-allow-ips` | Uvicorn | `127.0.0.1,::1` | The client address and scheme (`X-Forwarded-For`, `X-Forwarded-Proto`) that the application sees |

An empty list (`[]`) in `trustedProxyCidrs` trusts no proxy. MINT then ignores all forwarded headers.

Add only the address or the smallest CIDR of your proxy. With a broad range, any host in that range can send a false client IP and get past the rate limiter.

### Proxy on the same host

With the direct install, a host proxy that connects to `127.0.0.1:8001` needs no change. The defaults trust loopback.

With the Docker install, MINT does not see `127.0.0.1` as the peer. Docker forwards the connection, and MINT sees the gateway address of the Compose network (for example `172.18.0.1`). To find the address that MINT sees:

1. Sign in through the public URL.
2. Read your sign-in event from the [audit log](/admin/platform-settings#logs-and-audit-log) with the token of a user with `platform.view_logs`:

   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "https://mint.example.org/api/admin/audit?action=auth.login_success&limit=1"
   ```

3. If its `ip` field shows a `172.x.0.1` gateway address in place of your own address, add that address to `MINT_SERVER__TRUSTED_PROXY_CIDRS`.

### Proxy in a container or on another host

Set `trustedProxyCidrs` to the address of the proxy container or host. For Docker, add the variable to the `app` service:

```yaml
environment:
  MINT_SERVER__TRUSTED_PROXY_CIDRS: '["127.0.0.1/32", "::1/128", "172.18.0.0/16"]'
```

For the direct install, also add the same addresses to `--forwarded-allow-ips` in the systemd unit:

```ini
ExecStart=/opt/mint/.venv/bin/mint-platform serve --platform-dir /opt/mint --host 127.0.0.1 --port 8001 --forwarded-allow-ips 127.0.0.1,::1,10.0.0.5
```

A proxy on another host must reach MINT. Bind `--host` to the private interface only, and block port 8001 from all other hosts with a firewall.

## Streams and WebSockets

MINT keeps some connections open for a long time:

| Path | Type | Use |
|---|---|---|
| `GET /api/events` | Server-sent events | [Realtime updates](/admin/configuration#realtimeenabled) and presence |
| Plugin job streams under `/api/...` | Server-sent events | Job progress in plugin pages |
| `/api/admin/terminal/ws` | WebSocket | **Admin -> System -> Terminal** (only when `MINT_ADMIN_TERMINAL_ENABLED` is on) |

The event streams send the header `X-Accel-Buffering: no`, so nginx does not buffer them. `/api/events` sends a keepalive comment every 20 seconds, so the nginx default `proxy_read_timeout` of 60 seconds is sufficient for it. The `300s` in the example gives quiet job streams more time.

A proxy or CDN that ignores `X-Accel-Buffering` must turn off response buffering for these paths. Its idle timeout must be longer than 20 seconds.

The WebSocket needs the `Upgrade` and `Connection` headers. The `map` block of the nginx example passes them. Without them, the admin terminal does not connect.

## Request size

nginx accepts request bodies up to 1 MB by default and refuses larger bodies with `413 Request Entity Too Large`. Set `client_max_body_size` to the largest upload that you expect. MINT accepts plugin bundles (`.mint`) up to 200 MB, and plugins can accept larger data files. The examples use 1 GB.

## Verify the proxy

1. Check that MINT answers through the proxy:

   ```bash
   curl -I https://mint.example.org/api/health
   ```

   The response is `HTTP/2 200`.
2. Check that the proxy does not buffer the event stream. Sign in and open the browser developer tools. On the **Network** tab, find the `events` request. Its type is `eventsource`, and it stays pending.
3. Check the client IP in the audit log, as in [Proxy on the same host](#proxy-on-the-same-host).

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `502 Bad Gateway` | MINT does not run, or the proxy points to the wrong address. Run `curl -I http://127.0.0.1:8001/api/health` on the host |
| `413 Request Entity Too Large` on upload | `client_max_body_size` (nginx) or `request_body max_size` (Caddy) is too small |
| The rate limit applies to all users | All requests seem to come from one address. The proxy does not send `X-Forwarded-For`, or its address is not in `server.trustedProxyCidrs`. See [Rate limiting](/admin/authentication#rate-limiting) |
| The audit log shows `172.x.0.1` for all users | MINT does not trust the Docker gateway address. See [Proxy on the same host](#proxy-on-the-same-host) |
| Passkey sign-in fails with an origin or RP ID error | `server.rpId` does not match the public host name, or MINT does not trust the proxy that sends `X-Forwarded-Host` |
| Login fails, and the browser drops the cookie | `externalUrl` starts with `https://`, but users open MINT over plain HTTP. See [Public URL](#public-url) |
| Pages do not update when other users make changes | The proxy buffers `/api/events`, or closes it in less than 20 seconds. See [Streams and WebSockets](#streams-and-websockets) |
| The admin terminal does not connect | The proxy does not pass the WebSocket `Upgrade` header |

Next: [First-run setup](/admin/first-run).
