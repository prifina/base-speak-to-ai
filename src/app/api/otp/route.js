import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";

const client = new DynamoDBClient({
  region: process.env.MY_REGION,
  credentials: {
    accessKeyId: process.env.MY_ACCESS_KEY,
    secretAccessKey: process.env.MY_SECRET_KEY,
  },
});
const ddb = DynamoDBDocumentClient.from(client);

export async function POST(request) {
  try {
    const { id, ...rest } = await request.json();

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const createdAt = new Date().toISOString();
    const expire = Math.floor(Date.now() / 1000) + 3600;

    await ddb.send(
      new PutCommand({
        TableName: "service-otp",
        Item: {
          id,
          otp,
          createdAt,
          expire,
          ...rest,
        },
      })
    );

    return NextResponse.json({ id, otp });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
