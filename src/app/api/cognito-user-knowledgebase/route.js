import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cognitoId = searchParams.get("cognitoId");

    if (!cognitoId) {
      return NextResponse.json(
        { error: "cognitoId is required" },
        { status: 400 },
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
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/cognito-user-knowledgebase" });
    return handleApiError(err, "get cognito user knowledgebase failed");
  }
}

export const GET = withTelemetryRoute(handler);
