import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ...rest } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is missing" }, { status: 400 });
    }

    const variables = { userId, ...rest };

    const mutation = `
      mutation UpdateUser(
        $userId: ID!
        $ownerId: ID
        $knowledgebaseId: ID
        $networkId: String
        $title: String
        $caption: String
        $useCase: String
      ) {
        updateUser(
          userId: $userId
          ownerId: $ownerId
          knowledgebaseId: $knowledgebaseId
          networkId: $networkId
          title: $title
          caption: $caption
          useCase: $useCase
        ) {
          userId
        }
      }
    `;

    await graphqlRequestUserPool({ query: mutation, variables });

    // Create CognitoUserKnowledgebase relationship
    const upsertMutation = `
      mutation UpsertCognitoUserKnowledgebase(
        $cognitoId: ID!
        $knowledgebaseId: ID!
      ) {
        upsertCognitoUserKnowledgebase(
          cognitoId: $cognitoId
          knowledgebaseId: $knowledgebaseId
        ) {
          cognitoId
          knowledgebaseId
        }
      }
    `;

    await graphqlRequestUserPool({
      query: upsertMutation,
      variables: {
        cognitoId: variables.ownerId,
        knowledgebaseId: variables.knowledgebaseId,
      },
    });

    return NextResponse.json({ statusText: "OK" });
  } catch (err) {
    return handleApiError(err, "add new twin failed");
  }
}