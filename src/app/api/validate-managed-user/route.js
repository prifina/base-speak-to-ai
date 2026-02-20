import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const query = `
      query GetUser($userId: ID!) {
        getUser(userId: $userId) {
          userId
          knowledgebaseId
          status
          networkId
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { userId },
    });

    if (!data.getUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const { userId: returnedUserId, knowledgebaseId, status, networkId } = data.getUser;

    // Only return data if status is "Managed"
    if (status !== "Managed") {
      return NextResponse.json(
        { error: "User is not managed" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      userId: returnedUserId,
      knowledgebaseId,
      status,
      networkId,
    });
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/validate-managed-user" });
    return handleApiError(err, "Managed user validation failed");
  }
}

export const GET = withTelemetryRoute(handler);
