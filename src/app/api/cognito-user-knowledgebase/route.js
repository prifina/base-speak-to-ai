import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cognitoId = searchParams.get("cognitoId");

    if (!cognitoId) {
      return NextResponse.json(
        { error: "cognitoId is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(data.getCognitoUserKnowledgebase || []);
  } catch (err) {
    return handleApiError(err, "get cognito user knowledgebase failed");
  }
}
