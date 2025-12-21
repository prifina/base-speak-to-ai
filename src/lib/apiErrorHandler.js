import { NextResponse } from "next/server";

const AUTH_ERROR_CODES = [
  "JWT_MISSING",
  "JWT_INVALID",
  "JWT_EXPIRED",
  "UNAUTHORIZED",
];

export function handleApiError(err, defaultMessage = "Request failed") {
  if (AUTH_ERROR_CODES.includes(err.code)) {
    return NextResponse.json(
      {
        error: err.message || defaultMessage,
        code: err.code,
      },
      { status: 401 }
    );
  }
  //"VALIDATION_ERROR",
  return NextResponse.json(
    {
      error: err.message || defaultMessage,
      code: err.code || "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
