import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const { knowledgebaseId, localize } = await request.json();

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "knowledgebaseId is required" },
        { status: 400 }
      );
    }

    if (!localize) {
      return NextResponse.json(
        { error: "localize data is required" },
        { status: 400 }
      );
    }

    const mutation = `
      mutation UpsertAccountByKnowledgebase($knowledgebaseId: ID!, $localize: AWSJSON!) {
        upsertAccountByKnowledgebase(knowledgebaseId: $knowledgebaseId, localize: $localize) {
          id
          localize
        }
      }
    `;

    const data = await graphqlRequestIAM({
      query: mutation,
      variables: {
        knowledgebaseId,
        localize: JSON.stringify(localize),
      },
    });

    const account = data?.upsertAccountByKnowledgebase;

    if (!account) {
      return NextResponse.json(
        { error: "Failed to update account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating account localize:", error);
    return NextResponse.json(
      { error: "Failed to update account localize" },
      { status: 500 }
    );
  }
}

export const POST = withTelemetryRoute(handler);
