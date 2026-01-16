import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, env, returnUrl, configurationId } = body;

    if (!customerId || !env) {
      return NextResponse.json(
        { error: "customerId and env are required" },
        { status: 400 }
      );
    }

    const query = `
      query GetPortalSession($input: CreatePortalSessionInput!) {
        getPortalSession(input: $input) {
          url
        }
      }
    `;

    const input = {
      customerId,
      env,
      ...(returnUrl && { returnUrl }),
      ...(configurationId && { configurationId }),
    };

    const data = await graphqlRequestUserPool({
      query,
      variables: { input },
    });

    return NextResponse.json({ url: data.getPortalSession?.url || null });
  } catch (err) {
    return handleApiError(err, "get portal session failed");
  }
}
