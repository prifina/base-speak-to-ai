import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const networkId = searchParams.get("networkId");
    const env = searchParams.get("env") || "dev";

    if (!networkId) {
      return NextResponse.json(
        { error: "networkId is required" },
        { status: 400 }
      );
    }

    const query = `
      query GetNetworkConfig($networkId: ID!, $env: String!) {
        getNetworkConfig(networkId: $networkId, env: $env) {
          networkId
          business_profile
          modifiedAt
          portalConfigurationId
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { networkId, env },
    });

    return NextResponse.json({ networkConfig: data.getNetworkConfig || null });
  } catch (err) {
    return handleApiError(err, "get network config failed");
  }
}
