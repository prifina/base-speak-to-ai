import { signAntiBotToken } from "@/lib/antibot/antibotToken";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const token = signAntiBotToken({
    action: "login_form",
    ttlMs: 10 * 60 * 1000,
  });

  return <LoginForm token={token} />;
}
