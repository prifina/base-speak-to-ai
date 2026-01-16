import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const host = request.headers.get("host");
    let environment = "dev";
    
    if (
      host.startsWith("base.") ||
      host.startsWith("hub.") ||
      (process.env.NEXT_PUBLIC_PROD_HOST &&
        host.startsWith(process.env.NEXT_PUBLIC_PROD_HOST))
    ) {
      environment = "prod";
    }

    const query = `
      query GetConfig($id: String!, $isProd: Boolean) {
        getConfig(id: $id, isProd: $isProd) {
          responseLengthList { label value }
          followUpEncouragementList { label value }
          interactionStyleList { label value }
          responsePerspectiveList { label value }
          listUpdated
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { id: "speak-to", isProd: environment === "prod" },
    });

    return NextResponse.json({ config: data.getConfig || {} });
  } catch (err) {
    return handleApiError(err, "get config failed");
  }
}
