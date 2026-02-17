//import { signAntiBotToken } from "@/lib/antibot/antibotToken";
import { signAntiBotToken } from "@prifina-dev/auth-components";
import SignupPageClient from "./SignupPageClient";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const token = signAntiBotToken({
    action: "signup_form",
    ttlMs: 10 * 60 * 1000,
  });

  return <SignupPageClient token={token} />;
}
