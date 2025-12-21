import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const query = `query Health { health }`;
    const data = await graphqlRequestUserPool({ query });
    return NextResponse.json({ health: data?.health });
  } catch (err) {
    return handleApiError(err, "Health check failed");
  }
}

/*
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("cognitoIdToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const query = `
      query Health {
        health
      }
    `;

    const data = await graphqlRequestUserPool({ query, token });

    return NextResponse.json({ health: data?.health });
  } catch (err) {
    console.log("Error", err);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
*/
