import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";

export async function GET(request) {
  try {
    const host = request.headers.get("host");
    const env = host?.includes("localhost") ? "dev" : "prod";

    const searchParams = request.nextUrl.searchParams;
    const queryParam = searchParams.get("user");
    const username = searchParams.get("username");
    const loginType = searchParams.get("loginType");

    let query;
    if (username && loginType) {
      query = `query {
        getLoginKey(loginKey: "${queryParam}", env: "${env}", username: "${username}", loginType: ${loginType}) {
          message
          knowledgebaseId
          username
        }
      }`;
    } else {
      query = `query {
        getLoginKey(loginKey: "${queryParam}", env: "${env}") {
          message
          knowledgebaseId
          username
        }
      }`;
    }

    const data = await graphqlRequestIAM({ query });
    console.log("DATA ", data);
    return NextResponse.json({ login: data?.getLoginKey });
  } catch (err) {
    console.log("Error", err);
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Login check failed" }, { status: 500 });
  }
}
