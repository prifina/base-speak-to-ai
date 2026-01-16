import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { transformCognitoUser } from "@/lib/cognitoUserTransform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new CognitoIdentityProviderClient({
  region: process.env.MY_REGION,
  credentials: {
    accessKeyId: process.env.MY_ACCESS_KEY,
    secretAccessKey: process.env.MY_SECRET_KEY,
  },
});

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const returnUser = searchParams.get("returnUser") === "true";

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const command = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      Filter: `email = "${email}"`,
      Limit: 1,
    });

    const response = await client.send(command);
    const exists = response.Users && response.Users.length > 0;

    if (returnUser && exists) {
      const cognitoUser = response.Users[0];
      const transformedUser = transformCognitoUser(cognitoUser);
      return NextResponse.json(transformedUser);
    }

    return NextResponse.json({ available: !exists });
  } catch (error) {
    console.error("Error checking email availability:", error);
    return NextResponse.json(
      { error: "Failed to check email availability" },
      { status: 500 }
    );
  }
}
