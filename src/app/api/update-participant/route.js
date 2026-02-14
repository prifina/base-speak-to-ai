import { NextResponse } from "next/server";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

async function handler(request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.CORE_API_URL}/events/update-participant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": `${process.env.CORE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    await captureException(error, { kind: "route_handler", runtime: "node", route: "/api/update-participant" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withTelemetryRoute(handler);
