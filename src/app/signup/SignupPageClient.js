"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { SignupForm } from "@prifina-dev/auth-components";
import { useRouter } from "next/navigation";

import {
  verifyEmailAttribute,
  requestEmailVerificationCode,
} from "@/lib/userAttributes";
import { toaster } from "@/components/ui/toaster";

import { EVALS } from "@/lib/appConfig";
import { UI_TEXT } from "@/lib/uiStrings";

import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";

import { Loading } from "@/components/Loading";

import { configureAmplify } from "@/lib/amplify";

export default function SignupPageClient({ token }) {
  //function SignupFormContent({ token }) {
  const router = useRouter();
  const hasConfig = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const store = useStore(
    useShallow((state) => ({
      usernameAvailable: state.usernameAvailable,
      setKnowledgebaseId: state.setKnowledgebaseId,
      isLoggedIn: state.isLoggedIn,
    })),
  );

  useEffect(() => {
    if (!hasConfig.current) {
      hasConfig.current = true;
      configureAmplify();
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  return (
    <SignupForm
      token={token}
      store={store}
      config={{
        termsOfUse: EVALS.termsOfUse,
        privacyPolicy: EVALS.privacyPolicy,
      }}
      uiText={UI_TEXT.signup}
      userAttributes={{
        verifyEmailAttribute,
        requestEmailVerificationCode,
      }}
      toaster={toaster}
      onSuccess={() => {
        console.log("Signup success!");
        router.push("/home");
      }}
      onError={(error) => {
        console.error("Signup error:", error);
      }}
    />
  );
}
/* 
export default function SignupPageClient({ token }) {
  return (
    <Suspense fallback={<Loading />}>
      <SignupFormContent token={token} />
    </Suspense>
  );
}
 */
