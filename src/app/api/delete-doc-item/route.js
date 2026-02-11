import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const { knowledgebaseId, itemId } = await request.json();

    if (!knowledgebaseId || !itemId) {
      return NextResponse.json(
        { error: "Missing knowledgebaseId/itemId" },
        { status: 400 },
      );
    }

    const mutation = `
      mutation RemoveKnowledgebaseItem($knowledgebaseId: ID!, $itemId: ID!) {
        removeKnowledgebaseItem(knowledgebaseId: $knowledgebaseId, itemId: $itemId) {
          success
          itemId
          archivedPath
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query: mutation,
      variables: { knowledgebaseId, itemId },
    });

    return NextResponse.json({
      status: "OK",
      result: data.removeKnowledgebaseItem,
    });
  } catch (err) {
    return handleApiError(err, "delete doc item failed");
  }
}

export const POST = withTelemetryRoute(handler);
