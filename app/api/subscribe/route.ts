import { NextResponse } from "next/server";
import { clientKey, overLimit } from "@/lib/rate-limit";
import {
  ERROR_STATUS,
  parseSubscribeRequest,
  type SubscribeError,
  type SubscribeResponse,
} from "@/lib/subscribe-contract";

/**
 * `POST /api/subscribe`.
 *
 * It validates, rate-limits and screens the honeypot, then answers. It contacts
 * nothing and stores nothing — proposal 0003 removed the email pipeline because
 * this is a portfolio demonstration of a fictional brand, and a live sender
 * would have brought a service account, a DPA, a third-country transfer and
 * Communications Law § 30A with it.
 *
 * The address exists for the lifetime of this function and is discarded when it
 * returns. That is the whole data lifecycle, and §9 says so.
 */

export const dynamic = "force-dynamic";

/** Node, not edge: T-02's rate-limit window is module state in one long-lived process. */
export const runtime = "nodejs";

function fail(error: SubscribeError) {
  return NextResponse.json<SubscribeResponse>(
    { ok: false, error },
    { status: ERROR_STATUS[error] },
  );
}

function succeed() {
  return NextResponse.json<SubscribeResponse>({ ok: true }, { status: 200 });
}

/**
 * AC-057. The only thing this route is permitted to write anywhere.
 *
 * A code and nothing else — never the address, never the body, never the key,
 * and deliberately not the caught error either. An upstream client that puts the
 * request payload in its error message is the normal case, not the exotic one,
 * and `console.error(err)` is how an address ends up in a log file that has a
 * different retention policy from the database nobody stored it in.
 *
 * `stage` is a fixed string chosen at the call site. It is not interpolated from
 * anything a caller sends.
 */
function logFailure(stage: string) {
  console.error(`subscribe: ${stage}`);
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch {
    // AC-057's real mechanism. Without this boundary an unexpected throw
    // escapes to the framework, which prints a stack trace — and once the
    // Resend call lands in T-06, that stack can carry the payload with it.
    // Nothing about the caught value is logged or returned.
    logFailure("unhandled");
    return fail("upstream_failed");
  }
}

async function handle(request: Request) {
  // AC-023, checked before the body is read. A limiter that parses first does
  // the work an abusive caller wanted done, and the point of a limit is to stop
  // spending anything on them.
  if (overLimit(clientKey(request.headers))) {
    return fail("rate_limited");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Malformed JSON is indistinguishable from a malformed address as far as
    // the caller needs to know, and saying more would describe the parser.
    return fail("invalid_email");
  }

  const parsed = parseSubscribeRequest(body);
  if (!parsed.ok) {
    return fail(parsed.error);
  }

  // AC-022. A filled honeypot answers exactly as success does — same status,
  // same body, no timing tell worth the name — because a bot that learns it was
  // detected comes back with the field left empty.
  if (parsed.request.website !== "") {
    return succeed();
  }

  // Nothing downstream. 0003 removed the email pipeline: the address is
  // read, validated, and discarded when this handler returns.
  return succeed();
}
