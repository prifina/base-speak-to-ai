import { NextResponse } from "next/server";
import { parse } from "cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const cookies = parse(request.headers.get("cookie") || "");
  const knowledgebaseId = cookies.knowledgebaseId || "";
  
  return NextResponse.json({ knowledgebaseId });
}
