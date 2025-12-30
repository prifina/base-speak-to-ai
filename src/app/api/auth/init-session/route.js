import { NextResponse } from "next/server";
import { parse } from "cookie";
import { decodeJwt } from "jose";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get("redirect") || "/home";

    const cookies = parse(request.headers.get("cookie") || "");
    const lastAuthUser =
      cookies[
        `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.LastAuthUser`
      ];
    const idTokenKey = `CognitoIdentityServiceProvider.${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}.${lastAuthUser}.idToken`;
    const token = cookies[idTokenKey];

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = decodeJwt(token);
    const cognitoId = decoded.sub;

    const query = `
      query GetCognitoUserKnowledgebase($cognitoId: ID!) {
        getCognitoUserKnowledgebase(cognitoId: $cognitoId) {
          user {
            cognitoId
            knowledgebaseId
          }
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { cognitoId },
    });

    const users = data.getCognitoUserKnowledgebase?.user;
    const knowledgebaseId = Array.isArray(users) && users.length > 0 ? users[0].knowledgebaseId : null;

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "No knowledgebase found for user" },
        { status: 404 }
      );
    }

    const response = NextResponse.redirect(new URL(redirect, request.url));
    response.cookies.set("knowledgebaseId", knowledgebaseId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Init session error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
