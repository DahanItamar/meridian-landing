# 0006 — Cloudflare in front of the origin

> Status: proposed · 2026-08-22 · Against spec version 3.1

## Motivation

The site deploys to `meridian.itamardahan.com`, on a host that already serves two
other sites behind Cloudflare. Cloudflare is not an optional extra here: the
server block gates the origin with `return 403` for any connection outside a
Cloudflare range, matching `gitcheckup` and `wordlehebrew` on the same box.

The spec assumed one hop. §3 records the decision as **"Client IP taken from
`X-Forwarded-For`, trusting exactly one proxy hop — nginx is the only thing in
front"**, and it says in as many words that a CDN in front would change it. That
is now what happened, and the assumption fails in the direction that matters:

**Cloudflare appends to a caller-supplied `X-Forwarded-For` rather than replacing
it.** The first entry — the one AC-023's limiter keys on — is whatever the caller
wrote. A caller sending a fresh `X-Forwarded-For` per request never reaches the
ceiling, so the limit silently stops existing while every test still passes.

`CF-Connecting-IP` is a single address Cloudflare writes itself, overwriting
anything sent, so it cannot be forged from outside. It is trustworthy **only**
because the 403 gate means nothing else can reach the process to set it. The two
are a pair; the code says so at the function that depends on it.

## Criteria added

| ID | Criterion |
| --- | --- |
| AC-077 | The server block shall refuse, with `403`, any connection whose socket address is outside the published Cloudflare ranges, so that `CF-Connecting-IP` cannot be set by anything but Cloudflare. |

## Criteria amended

### AC-042 — name the header the deployment actually forwards

**Before:** The deployment shall serve the site over HTTPS at its subdomain, with
nginx forwarding the originating client IP in `X-Forwarded-For`.

**After:** The deployment shall serve the site over HTTPS at its subdomain, with
nginx forwarding the originating client IP in `CF-Connecting-IP`, and shall
resolve `$remote_addr` from that header via the real_ip module.

**Reason:** the criterion named a header that, in this topology, carries
attacker-controlled data. Leaving it would have the deployment satisfy the
written criterion and fail the intent of AC-023 at the same time — which is the
worst shape a criterion can have, because it passes.

## Section edits

### §3 Architecture — Decisions — replace

**Before:**

> **Client IP taken from `X-Forwarded-For`, trusting exactly one proxy hop** —
> nginx is the only thing in front.

**After:**

> **Client IP taken from `CF-Connecting-IP`** \
> Because: Cloudflare terminates in front of nginx (0006), and it *appends* to a
> caller-supplied `X-Forwarded-For` instead of replacing it — so the first entry
> is attacker-controlled and AC-023 keyed on it would be no limit at all.
> `CF-Connecting-IP` is written by Cloudflare over anything the caller sent. \
> Instead of: the first `X-Forwarded-For` entry — the original choice, correct
> while nginx was the only hop. \
> Depends on: AC-077's 403 gate. Without it any host can set the header and the
> decision reverses to being *less* safe than what it replaced. \
> Revisit if: Cloudflare is removed, or a second CDN is added.

**Reason for the replacement:** §3 records why, and this reverses a decision it
already holds. The old reason stays visible on the "Instead of" line, per the
rule that an unexplained reversal is indistinguishable from a later session not
knowing.

### §8 Edge Cases — replace

**Before:** | nginx does not forward the client IP | Every visitor shares one
bucket; the limit becomes global | `X-Forwarded-For` required in the server
block | AC-023 |

**After:** | The 403 gate is removed or misconfigured | `CF-Connecting-IP`
becomes settable by any caller that finds the origin address, and the per-IP
limit becomes unlimited | The gate and the header are documented as a pair, at
`clientKey` and in `deploy/` | AC-023, AC-077 |

**Reason:** the old row describes a failure that is now impossible — nginx
resolves `$remote_addr` through real_ip, so a missing header cannot silently
degrade to one global bucket. The failure that replaces it is more dangerous and
less obvious, because it looks like a working site.

### §9 Security & Permissions — add

> **Origin exposure.** The container binds `127.0.0.1:3100` and is unreachable
> from outside the host. The server block additionally refuses any socket
> address outside the published Cloudflare ranges (AC-077). The ranges are
> regenerated weekly by `/usr/local/sbin/refresh-cloudflare-ips.sh` on the host;
> a stale list 403s real visitors, which is the safe direction to fail.

### §10 Build Order — M5 — add

| Row | Closes |
| --- | --- |
| `- [ ] Cloudflare-gated server block, real_ip from CF-Connecting-IP, and the app keyed on it` | AC-077 |

## Impact

- Milestones affected: **M5**
- Criteria added: 1 · amended: 1 · retired: 0
- Census after merge: **62 active, 15 tombstoned, 77 ids issued** — corrected from 63/78,
  which was an arithmetic slip when this was drafted; 61 active + AC-077 is 62, and an
  amendment issues no id. The merged spec counts 62/15/77.
- §3 reverses one decision, §8 replaces one row, §9 gains a subsection
- No conflict with open proposals: `0002` carries a `TASKS.md` only
- `deploy/nginx.conf.example` is superseded for this host by the Cloudflare
  variant; the CSP moves out of nginx because `snippets/security-headers.conf`
  on this server sets `script-src 'self'` with no `'unsafe-inline'`, and browsers
  enforce the **intersection** of CSP headers — including it would block Next's
  inline hydration and leave a page that returns 200 and does nothing
