import { NextResponse } from "next/server";
import { parse } from "cookie";

const PROTECTED_PATHS = [
  "/dashboard",
  "/account",
  "/settings",
  "/subscription",
  "/home",
  "/knowledge",
  "/insights",
];
const PROTECTED_API_PATHS = [
  "/api/delete-doc-item",
  "/api/get-config",
  "/api/get-presigned-url",
  "/api/process-upload",
  "/api/user-knowledgebase",
  "/api/get-live-feed",
  "/api/list-message-objects",
  "/api/update-user",
  "/api/add-new-twin",
  "/api/get-network-config",
  "/api/get-subscription",
  "/api/cognito-user-knowledgebase",
  "/api/get-portal-session",
  "/api/validate-ai-name",
  "/api/get-participant-knowledgebase",
  "/api/protected",
  "/api/validate-managed-user",
];
const PUBLIC_API_PATHS = [
  "/api/auth",
  "/api/check-email",
  "/api/get-cognito-user",
  "/api/get-event",
  "/api/get-participant",
  "/api/get-knowledgebase-user",
  "/api/health",
  "/api/user-health",
  "/api/validate-antibot",
  "/api/update-participant",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log("[MIDDLEWARE] Checking path:", pathname);

  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) =>
    pathname.startsWith(p),
  );
  const isPublicApi = PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));

  console.log(
    "[MIDDLEWARE] isProtectedPage:",
    isProtectedPage,
    "isProtectedApi:",
    isProtectedApi,
    "isPublicApi:",
    isPublicApi,
  );

  if (isPublicApi) {
    console.log("[MIDDLEWARE] Public API, allowing");
    return NextResponse.next();
  }

  if (!isProtectedPage && !isProtectedApi) {
    console.log("[MIDDLEWARE] Not protected, allowing");
    return NextResponse.next();
  }

  const cookies = parse(req.headers.get("cookie") || "");
  const clientId =
    process.env.COGNITO_CLIENT_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const lastAuthUser =
    cookies[`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`];
  const idToken = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.idToken`;
  const token = cookies[idToken];

  console.log("[MIDDLEWARE] Has token:", !!token);

  if (!token) {
    console.log("[MIDDLEWARE] No token, redirecting to login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("[MIDDLEWARE] All checks passed, allowing");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
