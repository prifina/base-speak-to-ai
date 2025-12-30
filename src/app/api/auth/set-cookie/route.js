import { NextResponse } from "next/server";
import { verifyJwtFromCognito } from "@/lib/auth-helpers";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { decodeJwt } from "jose";

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    const payload = await verifyJwtFromCognito(idToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const decoded = decodeJwt(idToken);
    const cognitoId = decoded.sub;

    const query = `
      query GetCognitoUserKnowledgebase($cognitoId: ID!) {
        getCognitoUserKnowledgebase(cognitoId: $cognitoId) {
          user {
            knowledgebaseId
          }
        }
      }
    `;

    let knowledgebaseId = null;
    try {
      const data = await graphqlRequestUserPool({
        query,
        variables: { cognitoId },
      });
      const users = data.getCognitoUserKnowledgebase?.user;
      knowledgebaseId = Array.isArray(users) && users.length > 0 ? users[0].knowledgebaseId : null;
    } catch (err) {
      console.error("Failed to fetch knowledgebaseId:", err);
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set("cognitoIdToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60
    });

    if (knowledgebaseId) {
      res.cookies.set("knowledgebaseId", knowledgebaseId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    }

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
