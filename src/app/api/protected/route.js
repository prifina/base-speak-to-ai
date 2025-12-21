import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwtFromCognito } from "@/lib/auth-helpers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("cognitoIdToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await verifyJwtFromCognito(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  console.log("PAYLOAD ", payload);
  return NextResponse.json({
    message: "You are authenticated",
    userId: payload.sub,
    username: payload["cognito:username"],
  });
}
