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

    console.log("Init session - lastAuthUser:", lastAuthUser);
    console.log("Init session - token exists:", !!token);

    if (!token) {
      console.log("Init session - No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = decodeJwt(token);
    const cognitoId = decoded.sub;
    console.log("Init session - cognitoId:", cognitoId);

    const query = `
      query GetCognitoUserKnowledgebase($cognitoId: ID!) {
        getCognitoUserKnowledgebase(cognitoId: $cognitoId) {
          user {
            cognitoId
            knowledgebaseId
            created_at
            modified_at
          }
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { cognitoId },
    });

    console.log("Init session - GraphQL response:", JSON.stringify(data, null, 2));

    const knowledgebaseId = data?.getCognitoUserKnowledgebase?.user?.knowledgebaseId;

    console.log("Init session - knowledgebaseId:", knowledgebaseId);

    if (!knowledgebaseId) {
      console.log("Init session - No knowledgebaseId found");
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

    console.log("Init session - Success, redirecting to:", redirect);
    return response;
  } catch (error) {
    console.error("Init session error:", error);
    console.error("Init session error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to initialize session", details: error.message },
      { status: 500 }
    );
  }
}
