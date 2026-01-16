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
          id
          data
          modifiedAt
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: { id: "speak-to", isProd: environment === "prod" },
    });

    const config = data.getConfig?.data ? JSON.parse(data.getConfig.data) : {};
    
    // Transform config lists to match SelectField format (value/label instead of key/title)
    const transformList = (list) => 
      list?.map(item => ({ value: item.key, label: item.title })) || [];
    
    if (config.interactionStyleList) {
      config.interactionStyleList = transformList(config.interactionStyleList);
    }
    if (config.responseLengthList) {
      config.responseLengthList = transformList(config.responseLengthList);
    }
    if (config.responsePerspectiveList) {
      config.responsePerspectiveList = transformList(config.responsePerspectiveList);
    }
    if (config.followUpEncouragementList) {
      config.followUpEncouragementList = transformList(config.followUpEncouragementList);
    }
    
    return NextResponse.json({ config });
  } catch (err) {
    return handleApiError(err, "get config failed");
  }
}
