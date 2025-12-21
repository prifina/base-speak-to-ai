import { NextResponse } from "next/server";
import { graphqlRequestIAM } from "@/lib/graphqlRequestIAM";

export async function GET() {
  try {
    const query = `
      query Health {
        health
      }
    `;

    const data = await graphqlRequestIAM({ query });

    return NextResponse.json({ health: data?.health });
  } catch (err) {
    console.log("Error", err);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
