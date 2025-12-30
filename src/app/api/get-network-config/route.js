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

    const networkQuery = `
      query GetNetworkConfig($networkId: ID!, $env: String!) {
        getNetworkConfig(networkId: $networkId, env: $env) {
          networkId
          business_profile
          modifiedAt
          portalConfigurationId
          paymentLinks
          products
        }
      }
    `;

    const productsQuery = `
      query GetStripeProducts($networkId: String!, $env: String!) {
        getStripeProducts(networkId: $networkId, env: $env) {
          name
          items
        }
      }
    `;

    const [networkData, productsData] = await Promise.all([
      graphqlRequestUserPool({
        query: networkQuery,
        variables: { networkId, env },
      }),
      graphqlRequestUserPool({
        query: productsQuery,
        variables: { networkId, env },
      }),
    ]);

    return NextResponse.json({ 
      networkConfig: networkData.getNetworkConfig || null,
      plans: productsData.getStripeProducts || [],
    });
  } catch (err) {
    return handleApiError(err, "get network config failed");
  }
}
