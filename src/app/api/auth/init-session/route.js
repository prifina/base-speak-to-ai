import { NextResponse } from "next/server";
import { parse } from "cookie";
import { decodeJwt } from "jose";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  console.log("[INIT-SESSION] Starting init-session endpoint");
  try {
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get("redirect") || "/home";
    console.log("[INIT-SESSION] Redirect target:", redirect);

    const cookies = parse(request.headers.get("cookie") || "");
    const lastAuthUser =
      cookies[
        `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.LastAuthUser`
      ];
    const idTokenKey = `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.${lastAuthUser}.idToken`;
    const token = cookies[idTokenKey];

    console.log("[INIT-SESSION] lastAuthUser:", lastAuthUser);
    console.log("[INIT-SESSION] token exists:", !!token);

    if (!token) {
      console.log("[INIT-SESSION] No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = decodeJwt(token);
    const cognitoId = decoded["cognito:username"];
    console.log("[INIT-SESSION] cognitoId:", cognitoId);

    const query = `
      query GetCognitoUserKnowledgebase($cognitoId: ID!) {
        getCognitoUserKnowledgebase(cognitoId: $cognitoId) {
          cognitoId
          knowledgebaseId
          created_at
          modified_at
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { cognitoId },
    });

    console.log("[INIT-SESSION] GraphQL response:", JSON.stringify(data, null, 2));

    const users = data?.getCognitoUserKnowledgebase;
    const knowledgebaseId = Array.isArray(users) && users.length > 0 ? users[0].knowledgebaseId : null;

    console.log("[INIT-SESSION] knowledgebaseId:", knowledgebaseId);

    if (!knowledgebaseId) {
      console.log("[INIT-SESSION] No knowledgebaseId found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = NextResponse.redirect(new URL(redirect, request.url));
    response.cookies.set("knowledgebaseId", knowledgebaseId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    console.log("[INIT-SESSION] Success, setting cookie and redirecting to:", redirect);
    return response;
  } catch (error) {
    console.error("[INIT-SESSION] Error:", error);
    console.error("[INIT-SESSION] Error stack:", error.stack);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
