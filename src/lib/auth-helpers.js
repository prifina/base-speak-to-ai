import { createRemoteJWKSet, jwtVerify } from "jose";

const userPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const region = process.env.MY_REGION;

const issuer =
  userPoolId && region
    ? `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`
    : null;

const jwksUri = issuer ? `${issuer}/.well-known/jwks.json` : null;

let JWKS = null;
if (jwksUri) {
  try {
    JWKS = createRemoteJWKSet(new URL(jwksUri));
  } catch (err) {
    console.warn("Failed to create JWKS:", err.message);
  }
}

export async function verifyJwtFromCognito(token) {
  if (!JWKS || !issuer) {
    console.error(
      "JWT verification is not configured correctly (missing env vars)."
    );
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience: clientId,
    });
    return payload;
  } catch (err) {
    console.error("JWT verification failed", err);
    return null;
  }
}
