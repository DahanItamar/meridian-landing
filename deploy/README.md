# Deploy

One container, one nginx server block, one subdomain. Deployment is manual by
decision, not by omission — SPEC.md Assumption 10. A GitHub Action is a later
change proposal.

## Build and run

```bash
docker build -t meridian-landing .

docker run -d \
  --name meridian \
  --restart unless-stopped \
  -p 127.0.0.1:3100:3000 \
  meridian-landing
```

`-p 127.0.0.1:3100:3000` binds to loopback on purpose. The container has no
business being reachable from the internet directly — nginx terminates TLS and
is the only thing that should be able to reach it. Publishing on `0.0.0.0` is
how a container ends up serving plain HTTP on a public port beside the HTTPS one
that everybody tests.

Nothing is passed with `-e`, and nothing will be. There is no runtime
environment to configure: the site collects nothing, calls nothing, and
self-hosts its fonts at build time. `POST /api/subscribe` validates an address
and discards it — proposal 0003 removed the email pipeline, so the Resend
variables an earlier version of this file promised do not exist.

## Running the production build locally

`next start` does not work here. `next.config.ts` sets `output: "standalone"`,
which builds its own server; `next start` reports a missing build and is the
wrong thing to debug.

```bash
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
node .next/standalone/server.js          # PORT=3000 by default
```

The two `cp` lines are not optional — `standalone` deliberately omits static
assets and `public/`, so without them the page serves with no CSS and no poster
and looks like a different bug entirely. The Dockerfile does the same two copies.

**Stop that server before rebuilding.** It holds `.next/standalone` open, and on
Windows the next `next build` blocks on the locked directory rather than failing
with anything that names the cause.

## nginx

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/meridian
sudo sed -i 's/MERIDIAN_HOST/your.subdomain.example/g; s/MERIDIAN_PORT/3100/g' \
  /etc/nginx/sites-available/meridian
sudo ln -s /etc/nginx/sites-available/meridian /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Then the certificate:

```bash
sudo certbot --nginx -d your.subdomain.example
```

## Check it worked

```bash
curl -sI https://your.subdomain.example | grep -i 'strict-transport\|content-security'
curl -s https://your.subdomain.example/api/health          # {"ok":true}
docker inspect --format '{{.State.Health.Status}}' meridian # healthy
```

The one that is easy to get wrong and hard to notice: confirm the app sees a
real client address rather than the proxy's.

```bash
docker logs meridian | tail
```

If every request appears to come from `127.0.0.1`, the `X-Forwarded-For` header
is not arriving and AC-023's per-IP rate limit behaves as a single global
bucket. That failure passes every local test.

## Updating

```bash
git pull
docker build -t meridian-landing .
docker stop meridian && docker rm meridian
docker run -d --name meridian --restart unless-stopped -p 127.0.0.1:3100:3000 meridian-landing
```

There is a gap of a second or two between `stop` and `run` where the site is
down. For a pre-launch page that is acceptable; if it stops being acceptable,
run the new container on a second port and switch `proxy_pass` before removing
the old one.

## Before the first real visitor

Not deployment steps, but they block launch and they are easy to forget once the
site is up and looks finished:

- **The privacy page and the accessibility statement have not been read by
  anyone qualified.** Both ship in Hebrew at `/privacy` and `/accessibility`,
  written against a site that stores nothing; Israeli Regs. 5773-2013 reg. 35
  requires the accessibility statement in Hebrew, which it is. They describe a
  demonstration accurately, which is not the same as having been reviewed.
- **The Hebrew copy has not been read by a native speaker.** It is now the only
  copy on the site.
- **The animation in `components/brand/BeansLoader.tsx` has an unconfirmed
  licence.** See CREDITS.md.
