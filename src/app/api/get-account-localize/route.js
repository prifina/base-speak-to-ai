import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const { knowledgebaseId } = await request.json();

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "knowledgebaseId is required" },
        { status: 400 }
      );
    }

    const query = `
      query GetAccountByKnowledgebase($knowledgebaseId: ID!) {
        getAccountByKnowledgebase(knowledgebaseId: $knowledgebaseId) {
          id
          localize
        }
      }
    `;

    const data = await graphqlRequestIAM({
      query,
      variables: { knowledgebaseId },
    });

    const account = data?.getAccountByKnowledgebase;

    if (!account || !account.localize) {
      return NextResponse.json({ localize: null });
    }

    let localize = account.localize;
    
    // Parse once
    if (typeof localize === "string") {
      localize = JSON.parse(localize);
    }
    
    // Parse again if still a string (double-stringified)
    if (typeof localize === "string") {
      localize = JSON.parse(localize);
    }

    return NextResponse.json({ localize });
  } catch (error) {
    console.error("Error getting account localize:", error);
    return NextResponse.json(
      { error: "Failed to get account localize" },
      { status: 500 }
    );
  }
}

export const POST = withTelemetryRoute(handler);
