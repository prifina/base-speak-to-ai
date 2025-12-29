import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const knowledgebaseId = searchParams.get("knowledgebaseId");
    //knowledgebaseId = "00d4d766-bd00-4af3-bde0-c9b9ac78d1a9";
    const createdAtStart = searchParams.get("createdAtStart");
    const createdAtEnd = searchParams.get("createdAtEnd");

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "Query parameter knowledgebaseId is missing" },
        { status: 400 }
      );
    }

    if (!createdAtStart || !createdAtEnd) {
      return NextResponse.json(
        {
          error:
            "Query parameters createdAtStart and createdAtEnd are required",
        },
        { status: 400 }
      );
    }

    const query = `
      query ListMessageObjects(
        $knowledgebaseId: ID!
        $createdAtStart: AWSDateTime!
        $createdAtEnd: AWSDateTime!
        $limit: Int
        $nextToken: Int
      ) {
        listMessageObjects(
          knowledgebaseId: $knowledgebaseId
          createdAtStart: $createdAtStart
          createdAtEnd: $createdAtEnd
          limit: $limit
          nextToken: $nextToken
        ) {
          items {
            id
            answer
            created_at
            score
            session_id
            statement
            example_click
            quality
          }
          nextToken
        }
      }
    `;

    let allItems = [];
    let currentNextToken = undefined;

    do {
      const data = await graphqlRequestUserPool({
        query,
        variables: {
          knowledgebaseId,
          createdAtStart,
          createdAtEnd,
          limit: 50,
          nextToken: currentNextToken,
        },
      });

      allItems = allItems.concat(data.listMessageObjects.items);
      currentNextToken = data.listMessageObjects.nextToken;
    } while (currentNextToken);

    // Group by session_id and calculate statistics
    const sessionGroups = allItems.reduce((acc, message) => {
      if (!acc[message.session_id]) {
        acc[message.session_id] = [];
      }
      acc[message.session_id].push(message);
      return acc;
    }, {});

    const sessions = Object.entries(sessionGroups)
      .map(([sessionId, messages]) => {
        const sortedMessages = messages.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        const startTime = sortedMessages[0].created_at;
        const endTime = sortedMessages[sortedMessages.length - 1].created_at;
        const durationMs = new Date(endTime) - new Date(startTime);
        const durationMin = Math.round(durationMs / 60000);

        const scoresWithValue = sortedMessages.filter((m) => m.score > 0);
        const avgScore =
          scoresWithValue.length > 0
            ? scoresWithValue.reduce((sum, m) => sum + m.score, 0) /
              scoresWithValue.length
            : 0;
        const zeroScoreCount = sortedMessages.filter(
          (m) => m.score === 0
        ).length;

        return {
          sessionId,
          messages: sortedMessages,
          startTime,
          endTime,
          durationMin,
          messageCount: sortedMessages.length,
          avgScore,
          zeroScoreCount,
        };
      })
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    return NextResponse.json({ sessions });
  } catch (err) {
    return handleApiError(err, "list message objects failed");
  }
}
