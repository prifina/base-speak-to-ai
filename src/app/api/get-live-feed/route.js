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
    //userId = "tero-205";

    if (!userId) {
      return NextResponse.json(
        { error: "Query parameter userId is missing" },
        { status: 400 },
      );
    }

    const createdAt = searchParams.get("createdAt")
      ? Number(searchParams.get("createdAt"))
      : undefined;
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 50;
    const nextToken = searchParams.get("nextToken") || undefined;

    const query = `
      query ListMessages(
        $userId: ID!
        $createdAt: Float
        $limit: Int
        $nextToken: String
      ) {
        listMessages(
          userId: $userId
          createdAt: $createdAt
          limit: $limit
          nextToken: $nextToken
        ) {
          items {
            id
            userId
            knowledgebaseId
            sessionId
            statement
            answer
            score
            created_at
          }
          nextToken
        }
      }
    `;

    let allMessages = [];
    let currentNextToken = nextToken;

    do {
      const data = await graphqlRequestUserPool({
        query,
        variables: {
          userId,
          createdAt,
          limit: 50,
          nextToken: currentNextToken,
        },
      });

      allMessages = allMessages.concat(data.listMessages.items);
      currentNextToken = data.listMessages.nextToken;

      // Stop if we have 50 or more messages
      if (allMessages.length >= 50) {
        break;
      }
    } while (currentNextToken);

    // Sort by created_at descending (newest first) and limit to 50
    allMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    allMessages = allMessages.slice(0, 50);

    return NextResponse.json({ messages: allMessages });
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/get-live-feed" });
    return handleApiError(err, "get live feed failed");
  }
}

export const GET = withTelemetryRoute(handler);
