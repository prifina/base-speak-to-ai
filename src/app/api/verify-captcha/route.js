import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

async function handler(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return Response.json({ message: "Token is required" }, { status: 400 });
    }

    const secret = process.env.CAPTCHA_SECRET_KEY;
    if (!secret) {
      return Response.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();

    console.log(
      "CAPTCHA VERIFY",
      JSON.stringify(data, null, 2),
      verificationUrl,
    );

    if (!data.success) {
      return Response.json(
        { message: "Captcha verification failed" },
        { status: 400 },
      );
    }

    return Response.json({ message: "Captcha verified successfully" });
  } catch (error) {
    console.error("Captcha verification error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const POST = withTelemetryRoute(handler);
