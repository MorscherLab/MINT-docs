# Reverse proxy

MINT serves plain HTTP and does not terminate TLS. Put a reverse proxy in front of it for every production install. The proxy does four jobs:

- It terminates TLS for the public `https://` URL.
- It forwards the client address and scheme in `X-Forwarded-*` headers.
- It passes long-lived streams (server-sent events and one WebSocket) without buffering them.
- It accepts large request bodies (plugin bundles, data uploads).

Both install paths bind MINT to `127.0.0.1:8001` on the host: the [direct install](/admin/install-direct) through `mint-platform serve --host 127.0.0.1 --port 8001`, the [Docker install](/admin/install-docker) through `MINT_PORT=127.0.0.1:8001`. The examples below use that address and the public name `mint.example.org`.

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

Caddy gets TLS certificates automatically, redirects HTTP to HTTPS, sets the `X-Forwarded-*` headers, passes WebSocket upgrades and streams responses without extra configuration. With nginx, get certificates with `certbot --nginx -d mint.example.org`.

Enable and test the nginx site:

```bash
sudo ln -s /etc/nginx/sites-available/mint /etc/nginx/sites-enabled/mint
sudo nginx -t && sudo systemctl reload nginx
```

For a Caddy container in the same Compose project, see [Install on Linux (Docker)](/admin/install-docker#reverse-proxy). That proxy targets `app:8000`, not `127.0.0.1:8001`.

## Public URL

Set `server.externalUrl` in `config.json` to the public URL, with the `https://` scheme and no trailing path:

```json
{
  "server": {
    "externalUrl": "https://mint.example.org"
  }
}
```

MINT uses this value for these functions:

- Login cookies get the `Secure` flag, although the proxy talks plain HTTP to MINT.
- The [second factor](/admin/authentication#second-factor) is enforced only when `externalUrl` starts with `https://`.
- The `mint` CLI sign-in page is `<externalUrl>/device`.
- Calendar feed URLs and the platform origin that plugin pages receive use this value.

When `externalUrl` is empty, MINT builds these URLs from the `X-Forwarded-Host` and `X-Forwarded-Proto` headers of a trusted proxy. Otherwise it uses the address of the request it received.

Passkeys use `server.rpId` as the relying-party ID. Set it to the public host name (`mint.example.org`), or leave it empty and make sure that MINT trusts the proxy. An empty `rpId` comes from the trusted `X-Forwarded-Host` header, or else from the request host. Passkeys that users register under one ID do not work under a different ID, so decide on the host name before users register passkeys.

## Trusted proxies

MINT believes the `X-Forwarded-*` headers only from a proxy that it trusts. Two settings control this trust, and they must name the same proxy addresses:

| Setting | Read by | Default | Controls |
|---|---|---|---|
| `server.trustedProxyCidrs` (`config.json`) or `MINT_SERVER__TRUSTED_PROXY_CIDRS` | MINT | `["127.0.0.1/32", "::1/128"]` | Client IP for the rate limiter and the [audit log](/admin/platform-settings), passkey host from `X-Forwarded-Host` |
| `mint-platform serve --forwarded-allow-ips` | Uvicorn | `127.0.0.1,::1` | Client address and scheme (`X-Forwarded-For`, `X-Forwarded-Proto`) that the application sees |

An explicitly empty list (`[]`) in `trustedProxyCidrs` trusts no proxy. MINT then ignores all forwarded headers.

Add only the address or the smallest CIDR of your proxy. A broad range lets any host in that range set a false client IP, which defeats the rate limiter.

### Proxy on the same host

A host proxy that connects to `127.0.0.1:8001` needs no change with the direct install. The defaults trust loopback.

With the Docker install, the container does not see `127.0.0.1` as the peer. Docker forwards the connection, and MINT sees the gateway address of the Compose network (for example `172.18.0.1`). To find the address that MINT sees, do these steps:

1. Sign in through the public URL.
2. Read your sign-in event from the [audit log](/admin/platform-settings#logs-and-audit-log) with a token from a user with `platform.view_logs`:

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

A proxy on another host also requires MINT to listen on an address that the proxy can reach. Bind `--host` to the private interface only, and block port 8001 from all other hosts with a firewall.

## Streams and WebSockets

MINT keeps some connections open for a long time:

| Path | Type | Used for |
|---|---|---|
| `GET /api/events` | Server-sent events | [Realtime updates](/admin/configuration#realtimeenabled) and presence |
| Plugin job streams under `/api/...` | Server-sent events | Job progress in plugin pages |
| `/api/admin/terminal/ws` | WebSocket | **Admin -> Terminal** (only when `MINT_ADMIN_TERMINAL_ENABLED` is on) |

The event streams send the `X-Accel-Buffering: no` header, so nginx does not buffer them. `/api/events` sends a keepalive comment every 20 seconds, so the nginx default `proxy_read_timeout` of 60 seconds is sufficient for it. The `300s` value in the example above gives quiet job streams more time.

A proxy or CDN that ignores `X-Accel-Buffering` must turn off response buffering for these paths. Its idle timeout must be longer than 20 seconds.

The WebSocket needs the `Upgrade` and `Connection` headers. The nginx example passes them through the `map` block. Without them, the admin terminal does not connect.

## Request size

nginx accepts request bodies up to 1 MB by default, and refuses larger bodies with `413 Request Entity Too Large`. Set `client_max_body_size` to the largest upload that you expect. MINT accepts plugin bundles (`.mint`) up to 200 MB, and plugins can accept larger data files. The examples above use 1 GB.

## Verify the proxy

1. Check that MINT answers through the proxy:

   ```bash
   curl -I https://mint.example.org/api/health
   ```

   The response is `HTTP/2 200`.
2. Check that the event stream is not buffered. Sign in, open the browser developer tools, and find the `events` request on the **Network** tab. Its type is `eventsource`, and it stays in the pending state.
3. Check the client IP in the audit log, as in [Proxy on the same host](#proxy-on-the-same-host).

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `502 Bad Gateway` | MINT is not running, or the proxy points to the wrong address. Run `curl -I http://127.0.0.1:8001/api/health` on the host. |
| `413 Request Entity Too Large` on upload | `client_max_body_size` (nginx) or `request_body max_size` (Caddy) is too small. |
| Rate limit fires for all users | All requests seem to come from one address. The proxy does not send `X-Forwarded-For`, or its address is not in `server.trustedProxyCidrs`. |
| Audit log shows `172.x.0.1` for all users | Docker gateway address is not trusted. See [Proxy on the same host](#proxy-on-the-same-host). |
| Passkey sign-in fails with an origin or RP ID error | `server.rpId` does not match the public host name, or MINT does not trust the proxy that sends `X-Forwarded-Host`. |
| Pages do not update when other users make changes | The proxy buffers `/api/events`, or closes it in less than 20 seconds. See [Streams and WebSockets](#streams-and-websockets). |
| Admin terminal does not connect | The proxy does not pass the WebSocket `Upgrade` header. |

Next step: [First-run setup](/admin/first-run).
