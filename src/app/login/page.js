"use client";

import {
  useState,
  useContext,
  useEffect,
  useCallback,
  useReducer,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import { updateUserProfile } from "@/lib/userAttributes";

import {
  AbsoluteCenter,
  Box,
  Button,
  Input,
  Heading,
  Text,
  VStack,
  Alert,
  Field,
} from "@chakra-ui/react";

import { AuthContext } from "@/app/providers/AuthProvider";
import { configureAmplify } from "@/lib/amplify";
import CustomPINInput from "@/components/CustomPINInput";

import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { isEmail } from "@/utils";

/*

login scenarios
- cognito username exists
  - authenticator status = 99  (authenticator is not verified)
  - authenticator status = 1 username is random, automatically created
  - authenticator status = 2  username is valid, normal signup
  //- email not verified => has to verify email first

- email as login username => check login keys
  - when the cognito username is created and email validated, add new login key with cognito username. 
  

- ai-name as login username => check login keys
  - when new knowledgebase is created, add new login key with cognito username.
  - if login key exists, but no username then create new cognito user (auth status 1)

*/

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/home";
  const { user, loaded } = useContext(AuthContext);
  const {
    signIn,
    confirmSignIn,
    setLoginName,
    setKnowledgebaseId,
    setUserStatus,
  } = useStore(
    useShallow((state) => ({
      signIn: state.signIn,
      confirmSignIn: state.confirmSignIn,
      setLoginName: state.setLoginName,
      setKnowledgebaseId: state.setKnowledgebaseId,
      setUserStatus: state.setUserStatus,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      username: "",
      loginName: "",
      showPinInput: false,
    }
  );

  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const verify = useCallback(
    async (code) => {
      setLoginName(state.loginName);
      const signInResponse = await signIn(state.username);
      if (signInResponse) {
        const confirmSignInResponse = await confirmSignIn(code);
        if (confirmSignInResponse) {
          const { tokens } = await fetchAuthSession();
          const idToken = tokens.idToken.payload;
          const cognitoId = idToken["cognito:username"];
          let knowledgebaseId = idToken["custom:knowledgebaseId"] || "";

          if (!knowledgebaseId) {
            const res = await fetch(
              `/api/cognito-user-knowledgebase?cognitoId=${cognitoId}`
            );
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              knowledgebaseId = data[0].knowledgebaseId;
              await updateUserProfile({
                "custom:knowledgebaseId": knowledgebaseId,
              });
            }
          }

          if (knowledgebaseId) {
            setKnowledgebaseId(knowledgebaseId);
          }
        } else {
          setError("Invalid PIN code, try again");
          return false;
        }
      } else {
        setError("Invalid PIN code, try again");
        return false;
      }
      router.replace(redirect);
      return true;
    },
    [
      signIn,
      confirmSignIn,
      state.username,
      redirect,
      router,
      state.loginName,
      setLoginName,
      setKnowledgebaseId,
    ]
  );

  const checkUser = useCallback(
    async (user) => {
      try {
        const isEmailInput = isEmail(user);
        let data;

        if (isEmailInput) {
          const res = await fetch(
            `/api/check-email?email=${encodeURIComponent(
              user
            )}&returnUser=true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          data = await res.json();
        } else {
          const res = await fetch(
            `/api/get-cognito-user?username=${encodeURIComponent(user)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          data = await res.json();
        }

        if (data.error) {
          const loginRes = await fetch(`/api/auth/check-login?user=${encodeURIComponent(user)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (loginRes.status === 404) {
            setError("User not found");
            return false;
          }
          
          const loginData = await loginRes.json();
          if (loginData.login?.username) {
            setState({ username: loginData.login.username });
            return true;
          }
          
          setError("User not found");
          return false;
        }

        if (data.username) {
          const authenticatorStatus = data.attributes?.authenticatorStatus;
          
          setUserStatus({
            emailVerified: data.attributes?.emailVerified || false,
            authenticatorStatus: authenticatorStatus,
          });
          
          if (authenticatorStatus === "0") {
            setState({ username: data.username });
            return true;
          }
          
          if (["1", "2", "99"].includes(authenticatorStatus)) {
            const loginRes = await fetch(`/api/auth/check-login?user=${encodeURIComponent(user)}&username=${encodeURIComponent(data.username)}&loginType=2`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (loginRes.status === 404) {
              setError("User not found");
              return false;
            }
            
            const loginData = await loginRes.json();
            if (loginData.login?.username) {
              setState({ username: loginData.login.username });
              return true;
            }
          }
          
          setError("Invalid user status");
          return false;
        }

        setError("User not found");
        return false;
      } catch (error) {
        console.error("Error checking user:", error);
        setError("Error checking user");
        return false;
      }
    },
    [setUserStatus]
  );

  const handleNext = useCallback(async () => {
    if (!state.loginName.trim()) return;

    setIsBusy(true);
    const isValid = await checkUser(state.loginName);
    if (isValid) {
      setState({ showPinInput: true });
    }
    setIsBusy(false);
  }, [checkUser, state.loginName]);

  const handleBack = () => {
    setState({ showPinInput: false });
    setError("");
  };

  useEffect(() => {
    configureAmplify();
  }, []);

  useEffect(() => {
    if (loaded && user) {
      router.replace(redirect);
    }
  }, [loaded, user, redirect, router]);

  return (
    <AbsoluteCenter>
      <Box
        w={"450px"}
        mx="auto"
        mt={10}
        p={8}
        borderWidth="1px"
        borderRadius="lg"
      >
        <Heading mb={6}>Login</Heading>
        
        {!state.showPinInput ? (
          <VStack spacing={4} align="stretch">
            <Field.Root invalid={!!error}>
              <Field.Label>Username</Field.Label>
              <Input
                value={state.loginName}
                onChange={(e) => setState({ loginName: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNext();
                  }
                }}
                autoComplete="username"
                placeholder="Enter your username or email"
              />
              {error ? (
                <Field.ErrorText>{error}</Field.ErrorText>
              ) : (
                <Field.HelperText>Enter your username, email, or AI-name</Field.HelperText>
              )}
            </Field.Root>
            <Button 
              onClick={handleNext}
              loading={isBusy} 
              loadingText="Checking..."
              disabled={!state.loginName.trim()}
            >
              Next
            </Button>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            <Field.Root invalid={!!error}>
              <Field.Label>Enter PIN</Field.Label>
              <CustomPINInput
                verify={verify}
                isBusy={isBusy}
                setIsBusy={setIsBusy}
                reset={() => setError("")}
              />
              {error ? (
                <Field.ErrorText>{error}</Field.ErrorText>
              ) : (
                <Field.HelperText>
                  Enter your authenticator PIN code
                </Field.HelperText>
              )}
            </Field.Root>
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
          </VStack>
        )}
      </Box>
    </AbsoluteCenter>
  );
}
