import { NextResponse } from "next/server";
import { parse } from "cookie";

const PROTECTED_PATHS = ["/dashboard", "/account", "/settings", "/about"];
const PROTECTED_API_PATHS = ["/api/protected", "/api/user-health"];
const PUBLIC_API_PATHS = ["/api/auth"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));
  const isPublicApi = PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));

  if (isPublicApi || isProtectedApi || !isProtectedPage) {
    return NextResponse.next();
  }

  const cookies = parse(req.headers.get("cookie") || "");
  const lastAuthUser =
    cookies[
      `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.LastAuthUser`
    ];
  const idToken = `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.${lastAuthUser}.idToken`;
  const token = cookies[idToken];

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
