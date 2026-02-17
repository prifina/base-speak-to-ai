"use client";

import { useContext, useEffect, Suspense } from "react";

import { LoginForm } from "@prifina-dev/auth-components";
import { useRouter, useSearchParams } from "next/navigation";
//import { fetchAuthSession } from "aws-amplify/auth";
//import { updateUserProfile } from "@/lib/userAttributes";
import { Loading } from "@/components/Loading";

import { EVALS } from "@/lib/appConfig";
import { UI_TEXT } from "@/lib/uiStrings";

import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { AuthContext } from "@/app/providers/AuthProvider";
import { configureAmplify } from "@/lib/amplify";

function LoginContent({ token }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/home";
  const { user, loaded } = useContext(AuthContext);
  const store = useStore(
    useShallow((state) => ({
      signIn: state.signIn,
      confirmSignIn: state.confirmSignIn,
      setLoginName: state.setLoginName,
      setKnowledgebaseId: state.setKnowledgebaseId,
      setUserStatus: state.setUserStatus,
    })),
  );

  useEffect(() => {
    if (loaded && user) {
      router.replace(redirect);
    }
  }, [loaded, user, redirect, router]);

  useEffect(() => {
    configureAmplify();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  if (user) {
    return null;
  }

  return (
    <LoginForm
      token={token}
      store={store}
      config={{ generalGuideUrl: EVALS.generalGuideUrl }}
      uiText={UI_TEXT.login}
      onSuccess={() => {
        console.log("Login success!");
        router.replace(redirect);
      }}
      onError={(error) => {
        console.error("Login error:", error);
      }}
    />
  );
}
export default function LoginPageClient({ token }) {
  return (
    <Suspense fallback={<Loading />}>
      <LoginContent token={token} />
    </Suspense>
  );
}
