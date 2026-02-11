import { NextResponse } from "next/server";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

async function handler(request) {
  const { searchParams } = new URL(request.url);
  const knowledgebaseId = searchParams.get("knowledgebaseId");

  if (!knowledgebaseId) {
    return NextResponse.json(
      { error: "Query option knowledgebaseId is missing" },
      { status: 400 },
    );
  }

  try {
    const coreApiUrl = process.env.CORE_API_URL;
    const coreApiKey = process.env.CORE_API_KEY;
    const response = await fetch(
      `${coreApiUrl}/events/get-participant-knowledgebase?knowledgebaseId=${knowledgebaseId}`,
      {
        headers: {
          "x-api-key": coreApiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Core API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching participant by knowledgebaseId:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withTelemetryRoute(handler);
