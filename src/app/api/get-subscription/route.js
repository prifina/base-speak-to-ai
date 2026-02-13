import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgebaseId = searchParams.get("knowledgebaseId");

    if (!knowledgebaseId) {
      return NextResponse.json(
        { error: "knowledgebaseId is required" },
        { status: 400 },
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
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/get-subscription" });
    return handleApiError(err, "get subscription failed");
  }
}

export const GET = withTelemetryRoute(handler);
