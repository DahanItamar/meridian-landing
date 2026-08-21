import { NextResponse } from "next/server";

/**
 * Liveness probe for Docker and nginx (AC-040).
 *
 * It answers one question — is this process serving? — and deliberately answers
 * nothing else. It contacts no upstream, reads no environment and touches no
 * disk, because a health check that depends on a third party turns that third
 * party's outage into a container restart loop, and restarting the container
 * has never fixed anyone else's outage.
 *
 * `force-dynamic` because a statically generated `{ ok: true }` is a file on a
 * CDN, and a file cannot tell you the process behind it is alive. Being
 * evaluated per request is the entire point.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true });
}
