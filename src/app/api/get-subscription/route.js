import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgebaseId = searchParams.get("knowledgebaseId");

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "knowledgebaseId is required" },
        { status: 400 }
      );
    }

    const query = `
      query GetSubscription($knowledgebaseId: ID!) {
        getSubscription(knowledgebaseId: $knowledgebaseId) {
          subscriptionId
          cognitoId
          currentPeriodEnd
          currentPeriodStart
          customerId
          knowledgebaseId
          paymentStatus
          plan
          productId
          stage
          status
          updated
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { knowledgebaseId },
    });

    return NextResponse.json({ subscription: data.getSubscription || null });
  } catch (err) {
    return handleApiError(err, "get subscription failed");
  }
}
