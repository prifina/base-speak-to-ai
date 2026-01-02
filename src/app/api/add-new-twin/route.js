import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, knowledgebaseId, networkId, ownerId, verifiedEmail, ...rest } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is missing" }, { status: 400 });
    }

    // Set defaults
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);
    
    const variables = {
      userId,
      ownerId,
      knowledgebaseId,
      networkId,
      status: "Trial",
      trialEnds: trialEnds.toISOString().split("T")[0],
      ...rest
    };

    // Add email and dailyReport only if verifiedEmail exists
    if (verifiedEmail && verifiedEmail.trim() !== "") {
      variables.email = verifiedEmail;
      variables.dailyReport = true;
    }

    const mutation = `
      mutation UpdateUser(
        $userId: ID!
        $ownerId: ID
        $knowledgebaseId: ID
        $networkId: String
        $title: String
        $caption: String
        $useCase: String
        $email: String
        $status: String
        $trialEnds: String
        $dailyReport: Boolean
      ) {
        updateUser(
          userId: $userId
          ownerId: $ownerId
          knowledgebaseId: $knowledgebaseId
          networkId: $networkId
          title: $title
          caption: $caption
          useCase: $useCase
          ${verifiedEmail && verifiedEmail.trim() !== "" ? "email: $email" : ""}
          status: $status
          trialEnds: $trialEnds
          ${verifiedEmail && verifiedEmail.trim() !== "" ? "dailyReport: $dailyReport" : ""}
        ) {
          userId
        }
      }
    `;

    await graphqlRequestUserPool({ query: mutation, variables });

    // Insert KPI tracking
    const insertKPIMutation = `
      mutation InsertTwinKPI($input: InsertTwinKPIInput!) {
        insertTwinKPI(input: $input)
      }
    `;

    await graphqlRequestUserPool({
      query: insertKPIMutation,
      variables: {
        input: {
          userId,
          knowledgebaseId,
          networkId,
          ownerType: 0
        }
      }
    });

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
        cognitoId: ownerId,
        knowledgebaseId,
      },
    });

    // Timer API calls
    const callTimerApi = async (payload) => {
      return fetch(process.env.TIMER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.TIMER_API_KEY,
        },
        body: JSON.stringify(payload),
      });
    };

    const getDateOffset = (days) => {
      const date = new Date(variables.trialEnds);
      date.setDate(date.getDate() + days - 30);
      return date.toISOString().split("T")[0];
    };

    const basePayload = {
      knowledgebaseId,
      itemType: "PRIFINA",
      cognitoId: ownerId,
    };

    await callTimerApi({
      ...basePayload,
      prifinaStatus: "TRIAL NOTIFICATION",
      date: getDateOffset(23),
    });

    await callTimerApi({
      ...basePayload,
      prifinaStatus: "TRIAL ENDED",
      date: getDateOffset(30),
    });

    return NextResponse.json({ statusText: "OK" });
  } catch (err) {
    return handleApiError(err, "add new twin failed");
  }
}