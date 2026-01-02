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
  Flex,
  Image,
  Link,
} from "@chakra-ui/react";

import { AuthContext } from "@/app/providers/AuthProvider";
import { configureAmplify } from "@/lib/amplify";
import CustomPINInput from "@/components/CustomPINInput";

import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { isEmail } from "@/utils";
import { EVALS } from "@/lib/appConfig";
import { UI_TEXT } from "@/lib/uiStrings";

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
      loginType: null,
    }
  );

  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const verify = useCallback(
    async (code) => {
      setLoginName(state.loginName);
      const signInResponse = await signIn(state.username);
      if (signInResponse) {
        const confirmSignInResponse = await confirmSignIn(code, state.loginType);
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
      state.loginType,
      redirect,
      router,
      state.loginName,
      setLoginName,
      setKnowledgebaseId,
    ]
  );

  const checkUser = useCallback(
    async (user) => {
      console.log("[LOGIN] checkUser called with:", user);
      try {
        const isEmailInput = isEmail(user);
        console.log("[LOGIN] isEmailInput:", isEmailInput);
        let data;

        if (isEmailInput) {
          console.log("[LOGIN] Checking email:", user);
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
          console.log("[LOGIN] check-email response:", data);
        } else {
          console.log("[LOGIN] Checking username:", user);
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
          console.log("[LOGIN] get-cognito-user response:", data);
        }

        if (data.error) {
          console.log("[LOGIN] No cognito user found, trying check-login");
          const loginRes = await fetch(`/api/auth/check-login?user=${encodeURIComponent(user)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          console.log("[LOGIN] check-login status:", loginRes.status);
          
          if (loginRes.status === 404) {
            console.log("[LOGIN] check-login returned 404");
            setError("User not found");
            return false;
          }
          
          const loginData = await loginRes.json();
          console.log("[LOGIN] check-login response:", loginData);
          if (loginData.login?.username) {
            console.log("[LOGIN] Found username in check-login:", loginData.login.username);
            setState({ username: loginData.login.username });
            return true;
          }
          
          console.log("[LOGIN] No username in check-login response");
          setError("User not found");
          return false;
        }

        if (data.username) {
          console.log("[LOGIN] Found Cognito user:", data.username);
          const authenticatorStatus = data.attributes?.authenticatorStatus;
          console.log("[LOGIN] authenticatorStatus:", authenticatorStatus);
          
          setUserStatus({
            emailVerified: data.attributes?.emailVerified || false,
            authenticatorStatus: authenticatorStatus,
          });
          
          if (authenticatorStatus === "0") {
            console.log("[LOGIN] authenticatorStatus is 0, proceeding directly");
            setState({ username: data.username, loginType: null });
            return true;
          }
          
          if (["1", "2", "99"].includes(authenticatorStatus)) {
            console.log("[LOGIN] authenticatorStatus requires check-login, calling with loginType 2");
            const loginRes = await fetch(`/api/auth/check-login?user=${encodeURIComponent(user)}&username=${encodeURIComponent(data.username)}&loginType=2`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            console.log("[LOGIN] check-login with loginType 2 status:", loginRes.status);
            
            if (loginRes.status === 404) {
              console.log("[LOGIN] check-login with loginType 2 returned 404");
              setError("User not found");
              return false;
            }
            
            const loginData = await loginRes.json();
            console.log("[LOGIN] check-login with loginType 2 response:", loginData);
            if (loginData.login?.username) {
              console.log("[LOGIN] Found username in check-login with loginType 2:", loginData.login.username);
              setState({ username: loginData.login.username, loginType: 2 });
              return true;
            }
          }
          
          console.log("[LOGIN] Invalid authenticator status or no username found");
          setError("Invalid user status");
          return false;
        }

        console.log("[LOGIN] No username in response");
        setError("User not found");
        return false;
      } catch (error) {
        console.error("[LOGIN] Error in checkUser:", error);
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
        <Heading mb={6}>{UI_TEXT.login.title}</Heading>
        <Flex justifyContent="center" mb={6}>
          <Image
            src="/assets/data-center.svg"
            alt="Data Center"
            width="160px"
            height="auto"
          />
        </Flex>
        
        {!state.showPinInput ? (
          <VStack spacing={4} align="stretch">
            <Field.Root invalid={!!error}>
              <Field.Label>{UI_TEXT.login.usernameLabel}</Field.Label>
              <Input
                value={state.loginName}
                onChange={(e) => setState({ loginName: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNext();
                  }
                }}
                autoComplete="username"
                placeholder={UI_TEXT.login.usernamePlaceholder}
              />
              {error ? (
                <Field.ErrorText>{error}</Field.ErrorText>
              ) : (
                <Field.HelperText>{UI_TEXT.login.usernameHelper}</Field.HelperText>
              )}
            </Field.Root>
            <Button 
              onClick={handleNext}
              loading={isBusy} 
              loadingText={UI_TEXT.login.checkingText}
              disabled={!state.loginName.trim()}
            >
              {UI_TEXT.login.nextButton}
            </Button>
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            <Field.Root invalid={!!error}>
              <Field.Label>{UI_TEXT.login.pinLabel}</Field.Label>
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
                  {state.loginType === 2 ? UI_TEXT.login.otpHelper : UI_TEXT.login.pinHelper}
                </Field.HelperText>
              )}
            </Field.Root>
            <Button 
              onClick={handleBack} 
              variant="outline"
              loading={isBusy}
              loadingText="Verifying..."
            >
              {UI_TEXT.login.backButton}
            </Button>
          </VStack>
        )}
        
        <Flex justify="space-between" mt={6} fontSize="sm">
          <Link color="blue.500" onClick={() => window.open(EVALS.generalGuideDoc, "_blank")}>
            {UI_TEXT.login.needHelp}
          </Link>
          <Link color="blue.500" onClick={() => router.push("/signup")}>
            {UI_TEXT.login.noAccount}
          </Link>
        </Flex>
      </Box>
    </AbsoluteCenter>
  );
}
