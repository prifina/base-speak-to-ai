//import { signAntiBotToken } from "@/lib/antibot/antibotToken";

import { signAntiBotToken } from "@prifina-dev/auth-components";
import LoginPageClient from "./LoginPageClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const token = signAntiBotToken({
    action: "login_form",
    ttlMs: 10 * 60 * 1000,
  });

  return <LoginPageClient token={token} />;
}
