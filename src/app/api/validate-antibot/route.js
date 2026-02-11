import { NextResponse } from "next/server";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";
import { validateAntiBot } from "@/lib/antibot/antibotValidate";

async function handler(req) {
  const form = await req.formData();
  const action = String(form.get("ab_action") || "");

  const honeypotName = action === "login_form" ? "user_password" : "profile_url";

  const anti = validateAntiBot(form, {
    action,
    honeypotName,
    minElapsedMs: 1500,
  });

  // Honeypot: respond with ok=true but include a flag for client to check
  if (anti.honeypotTripped) {
    return NextResponse.json({ ok: true, blocked: true }, { status: 200 });
  }

  // Token invalid/expired/action mismatch
  if (!anti.ok) {
    return NextResponse.json(
      { ok: false, reason: anti.reason },
      { status: 400 }
    );
  }

  // Return validation result with score
  return NextResponse.json({
    ok: true,
    score: anti.score,
    tooFast: anti.tooFast,
    elapsedMs: anti.elapsedMs,
  });
}

export const POST = withTelemetryRoute(handler);
