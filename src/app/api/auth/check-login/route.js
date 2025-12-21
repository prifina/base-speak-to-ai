import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";

export async function GET(request) {
  try {
    const host = request.headers.get("host");
    const env = host?.includes("localhost") ? "dev" : "prod";

    const searchParams = request.nextUrl.searchParams;
    const queryParam = searchParams.get("user");

    const query = `query {
      getLoginKey(loginKey: "${queryParam}", env: "${env}") {
        message
        knowledgebaseId
        username
      }
    }`;

    const data = await graphqlRequestIAM({ query });
    console.log("DATA ", data);
    return NextResponse.json({ login: data?.getLoginKey });
  } catch (err) {
    console.log("Error", err);
    return NextResponse.json({ error: "Login check failed" }, { status: 500 });
  }
}
