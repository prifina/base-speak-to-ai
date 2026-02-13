import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler() {
  try {
    // Skip during build time
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_RUNTIME) {
      return NextResponse.json({ health: "build-time-skip" });
    }

    const query = `query Health { health }`;
    const data = await graphqlRequestUserPool({ query });
    return NextResponse.json({ health: data?.health });
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/user-health" });
    return handleApiError(err, "Health check failed");
  }
}

export const GET = withTelemetryRoute(handler);

/*
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("cognitoIdToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const query = `
      query Health {
        health
      }
    `;

    const data = await graphqlRequestUserPool({ query, token });

    return NextResponse.json({ health: data?.health });
  } catch (err) {
    console.log("Error", err);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
*/
