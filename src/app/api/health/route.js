import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const dynamic = "force-dynamic";

async function handler() {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_RUNTIME) {
      return NextResponse.json({ health: "build-time-skip" });
    }

    const query = `
      query Health {
        health
      }
    `;

    const data = await graphqlRequestIAM({ query });

    return NextResponse.json({ health: data?.health });
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/health" });
    console.log("Error", err);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}

export const GET = withTelemetryRoute(handler);
