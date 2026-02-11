import { signAntiBotToken } from "@/lib/antibot/antibotToken";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const token = signAntiBotToken({
    action: "signup_form",
    ttlMs: 10 * 60 * 1000,
  });

  return <SignupForm token={token} />;
}
