import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute, captureException } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const body = await request.json();
    console.log("UPLOAD BODY ", body);

    const response = await fetch(
      `${process.env.CORE_API_URL}/core/file-upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": process.env.CORE_API_KEY,
        },
        body: JSON.stringify(body),
      },
    );

    console.log("Result", response);

    if (!response.ok) {
      const err = await response.text();
      console.error(err);
      throw new Error(err);
    }

    const uploadStatus = await response.json();
    return NextResponse.json({ uploadStatus });
  } catch (err) {
    await captureException(err, { kind: "route_handler", runtime: "node", route: "/api/process-upload" });
    return handleApiError(err, "process upload failed");
  }
}

export const POST = withTelemetryRoute(handler);
