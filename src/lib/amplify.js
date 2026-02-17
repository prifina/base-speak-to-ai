"use client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
import { getAmplifyConfig } from "@/lib/amplifyConfig";

let configured = false;

export function configureAmplify() {
  if (configured) return;
  console.log("CONFIGURE ", getAmplifyConfig());
  Amplify.configure(getAmplifyConfig(), { ssr: true }); // puts tokens in cookies :contentReference[oaicite:2]{index=2}

  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({
      path: "/",
      expires: 30,
      secure: process.env.NODE_ENV === "production", // ✅ critical for localhost
      sameSite: "lax",
    }),
  );

  configured = true;
}

/*
// src/lib/amplify.js
"use client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          // optional, if you're using identity pool:
          identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
          // how users log in; tweak as you like
          signUpVerificationMethod: "code",
        },
      },
    },
    {
      ssr: true,
    }
  );

  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({
      // domain: ".yourdomain.com", // set if you need cross-subdomain cookies
      path: "/",
      expires: 30, // days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  );

  configured = true;
}
*/
