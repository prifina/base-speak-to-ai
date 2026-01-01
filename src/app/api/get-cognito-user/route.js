import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  console.log("[GET-COGNITO-USER] Starting get-cognito-user endpoint");
  
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    
    if (!username) {
      console.log("[GET-COGNITO-USER] Missing username parameter");
      return NextResponse.json({ error: "Username parameter is required" }, { status: 400 });
    }
    
    console.log("[GET-COGNITO-USER] Looking up username:", username);
    
    const query = `
      query GetCognitoUser($username: String!) {
        getCognitoUser(username: $username) {
          Username
          Enabled
          UserCreateDate
          UserLastModifiedDate
          UserStatus
          Attributes {
            Name
            Value
          }
        }
      }
    `;
    
    const data = await graphqlRequestIAM({
      query,
      variables: { username },
    });
    
    console.log("[GET-COGNITO-USER] GraphQL response:", JSON.stringify(data, null, 2));
    
    const cognitoUser = data?.getCognitoUser;
    
    if (!cognitoUser) {
      console.log("[GET-COGNITO-USER] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Parse attributes into a more usable format
    const attributes = {};
    cognitoUser.Attributes?.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });
    
    const userInfo = {
      username: cognitoUser.Username,
      enabled: cognitoUser.Enabled,
      userStatus: cognitoUser.UserStatus,
      userCreateDate: cognitoUser.UserCreateDate,
      userLastModifiedDate: cognitoUser.UserLastModifiedDate,
      attributes: {
        email: attributes.email,
        emailVerified: attributes.email_verified === 'true',
        givenName: attributes.given_name,
        familyName: attributes.family_name,
        name: attributes.name,
        preferredUsername: attributes.preferred_username,
        authenticatorStatus: attributes['custom:authenticator_status'],
        knowledgebaseId: attributes['custom:knowledgebaseId'],
      }
    };
    
    console.log("[GET-COGNITO-USER] Returning user info:", JSON.stringify(userInfo, null, 2));
    
    return NextResponse.json(userInfo);
    
  } catch (error) {
    console.error("[GET-COGNITO-USER] Error:", error);
    console.error("[GET-COGNITO-USER] Error stack:", error.stack);
    
    if (error.message?.includes('User does not exist')) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}