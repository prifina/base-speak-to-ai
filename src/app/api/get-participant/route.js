import { NextResponse } from "next/server";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

async function handler(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const participantId = searchParams.get("participantId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Query option eventId is missing" },
      { status: 400 },
    );
  }

  if (!participantId) {
    return NextResponse.json(
      { error: "Query option participantId is missing" },
      { status: 400 },
    );
  }

  try {
    const coreApiUrl = process.env.CORE_API_URL;
    const coreApiKey = process.env.CORE_API_KEY;
    const response = await fetch(
      `${coreApiUrl}/events/get-participant?eventId=${eventId}&participantId=${encodeURIComponent(participantId)}`,
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
    console.error("Error fetching participant:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withTelemetryRoute(handler);
