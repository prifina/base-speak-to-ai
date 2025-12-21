import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const queryParam = searchParams.get("user");
  console.log("USER ", queryParam);

  return NextResponse.json({
    username: "da687f6c-4961-43fb-9820-3b68b6446363",
  });
}
