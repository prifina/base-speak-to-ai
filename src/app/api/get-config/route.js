import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
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
      list?.map((item) => ({ value: item.key, label: item.title })) || [];

    if (config.interactionStyleList) {
      config.interactionStyleList = transformList(config.interactionStyleList);
    }
    if (config.responseLengthList) {
      config.responseLengthList = transformList(config.responseLengthList);
    }
    if (config.responsePerspectiveList) {
      config.responsePerspectiveList = transformList(
        config.responsePerspectiveList,
      );
    }
    if (config.followUpEncouragementList) {
      config.followUpEncouragementList = transformList(
        config.followUpEncouragementList,
      );
    }

    return NextResponse.json({ config });
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/get-config" });
    return handleApiError(err, "get config failed");
  }
}

export const GET = withTelemetryRoute(handler);
