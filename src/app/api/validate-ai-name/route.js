import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aiName = searchParams.get("aiName");

    if (!aiName) {
      return NextResponse.json(
        { error: "AI name is required" },
        { status: 400 },
      );
    }

    const query = `
      query GetUser($userId: ID!) {
        getUser(userId: $userId) {
          userId
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { userId: aiName },
    });

    // If user exists, AI name is taken (return 200)
    // If user doesn't exist, AI name is available (return 404)
    if (data.getUser) {
      return NextResponse.json({ available: false });
    } else {
      return NextResponse.json({ available: true }, { status: 404 });
    }
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/validate-ai-name" });
    return handleApiError(err, "AI name validation failed");
  }
}

export const GET = withTelemetryRoute(handler);
