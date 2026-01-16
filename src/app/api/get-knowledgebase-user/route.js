import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { knowledgebaseId } = await request.json();

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "knowledgebaseId is required" },
        { status: 400 }
      );
    }

    const query = `
      query GetKnowledgebaseUser($knowledgebaseId: ID!) {
        getKnowledgebaseUser(knowledgebaseId: $knowledgebaseId) {
          cognitoId
          knowledgebaseId
          created_at
          modified_at
        }
      }
    `;

    const data = await graphqlRequestIAM({
      query,
      variables: { knowledgebaseId },
    });

    const users = data?.getKnowledgebaseUser || [];
    const user = users[0];

    if (!user || !user.cognitoId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get Cognito user attributes
    const cognitoQuery = `
      query GetCognitoUser($username: String!) {
        getCognitoUser(username: $username) {
          Username
          Attributes {
            Name
            Value
          }
        }
      }
    `;

    const cognitoData = await graphqlRequestIAM({
      query: cognitoQuery,
      variables: { username: user.cognitoId },
    });

    const cognitoUser = cognitoData?.getCognitoUser;
    const preferredUsername = cognitoUser?.Attributes?.find(
      (attr) => attr.Name === "preferred_username"
    )?.Value;

    return NextResponse.json({
      preferred_username: preferredUsername || null,
    });
  } catch (error) {
    console.error("Error getting knowledgebase user:", error);
    return NextResponse.json(
      { error: "Failed to get knowledgebase user" },
      { status: 500 }
    );
  }
}
