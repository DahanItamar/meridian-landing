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

Nothing is passed with `-e`. There is no runtime environment to configure: the
site collects nothing, calls nothing, and self-hosts its fonts at build time.
That changes when the subscribe endpoint lands in M2, and the two Resend
variables go here — never prefixed `NEXT_PUBLIC_`, which is what makes AC-025
true by construction rather than by discipline.

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
is not arriving and AC-023's per-IP rate limit will behave as a single global
bucket once M2 lands. That failure passes every local test.

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

- **The privacy page and the accessibility statement do not exist yet.** Drafts
  are in `docs/legal/`, with eight placeholder values unfilled and no Hebrew.
  Israeli Regs. 5773-2013 reg. 35 requires the accessibility statement in
  Hebrew.
- **The Hebrew copy has not been read by a native speaker.** It is now the only
  copy on the site.
- **The animation in `components/brand/BeansLoader.tsx` has an unconfirmed
  licence.** See CREDITS.md.
