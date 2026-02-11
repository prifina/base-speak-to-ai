import { verifyAntiBotToken } from "./antibotToken";

/**
 * validateAntiBot(formData, options)
 *
 * Returns:
 * {
 *   ok: boolean,              // token valid & expected action & not expired
 *   honeypotTripped: boolean, // honeypot filled
 *   tooFast: boolean,         // timing signal
 *   elapsedMs: number|null,
 *   score: number,            // small score, higher => more suspicious
 *   reason: string|null
 * }
 *
 * Notes:
 * - Honeypot is handled separately because you often want to respond "success"
 *   to avoid giving bots feedback.
 * - Use with withTelemetryRoute() wrapper for API routes in this app.
 */
export function validateAntiBot(formData, options = {}) {
  const {
    action,
    honeypotName = "profile_url",
    minElapsedMs = 900,
  } = options;

  const token = String(formData.get("ab_token") || "");
  const started = Number(formData.get("ab_started") || 0);
  const honeypot = String(formData.get(honeypotName) || "");

  const result = {
    ok: false,
    honeypotTripped: false,
    tooFast: false,
    elapsedMs: null,
    score: 0,
    reason: null,
  };

  // 1) Honeypot
  if (honeypot.trim().length > 0) {
    result.honeypotTripped = true;
    return result;
  }

  // 2) Token verification
  const payload = verifyAntiBotToken(token);
  if (!payload) {
    result.reason = "invalid_token";
    return result;
  }
  if (!payload.exp || payload.exp < Date.now()) {
    result.reason = "expired_token";
    return result;
  }
  if (typeof action === "string" && action.length > 0 && payload.action !== action) {
    result.reason = "action_mismatch";
    return result;
  }

  result.ok = true;

  // 3) Timing signal
  if (started && Number.isFinite(started)) {
    const elapsed = Date.now() - started;
    result.elapsedMs = elapsed;
    if (elapsed < minElapsedMs) {
      result.tooFast = true;
      result.score += 2;
    }
  }

  return result;
}
