import crypto from "crypto";

const SECRET = process.env.AB_SECRET;

function hmac(input) {
  if (!SECRET) {
    console.error("[ANTIBOT] AB_SECRET environment variable is missing");
    // Return a deterministic but invalid signature in production to prevent crashes
    return crypto.createHash("sha256").update(input + "fallback").digest("base64url");
  }
  return crypto.createHmac("sha256", SECRET).update(input).digest("base64url");
}

export function signAntiBotToken({ action, ttlMs = 5 * 60 * 1000 }) {
  const payload = {
    action: String(action || ""),
    exp: Date.now() + Number(ttlMs),
    v: 1,
  };

  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = hmac(b64);

  return `${b64}.${sig}`;
}

export function verifyAntiBotToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;

  const [b64, sig] = parts;
  const expected = hmac(b64);

  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    return payload;
  } catch {
    return null;
  }
}
