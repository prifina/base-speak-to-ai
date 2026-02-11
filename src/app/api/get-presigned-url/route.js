import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const body = await request.json();
    const { fileName, fileType, uploadFolder, bucket, commandType, s3Key } =
      body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 },
      );
    }

    const finalS3Key = s3Key || `${uploadFolder}/${fileName}`;

    const query = `
      query GetPresignedUrl(
        $fileName: String!
        $fileType: String!
        $uploadFolder: String!
        $bucket: String
        $commandType: String
        $s3Key: String
      ) {
        getPresignedUrl(
          fileName: $fileName
          fileType: $fileType
          uploadFolder: $uploadFolder
          bucket: $bucket
          commandType: $commandType
          s3Key: $s3Key
        ) {
          url
        }
      }
    `;

    const data = await graphqlRequestUserPool({
      query,
      variables: {
        fileName,
        fileType,
        uploadFolder,
        bucket,
        commandType,
        s3Key: finalS3Key,
      },
    });

    return NextResponse.json({ url: data?.getPresignedUrl?.url });
  } catch (err) {
    return handleApiError(err, "get presigned url failed");
  }
}

export const POST = withTelemetryRoute(handler);
