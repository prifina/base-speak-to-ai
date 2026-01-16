import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Query option eventId is missing" },
      { status: 400 }
    );
  }

  try {
    const coreApiUrl = process.env.CORE_API_URL;
    const coreApiKey = process.env.CORE_API_KEY;
    const response = await fetch(
      `${coreApiUrl}/events/get-event?eventId=${eventId}`,
      {
        headers: {
          "x-api-key": coreApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Core API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
