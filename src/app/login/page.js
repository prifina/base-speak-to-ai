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
import { fetchAuthSession /*, signIn */ } from "aws-amplify/auth";
import { updateUserProfile } from "@/lib/userAttributes";

import {
  Carousel,
  AbsoluteCenter,
  Steps,
  ButtonGroup,
  Box,
  Button,
  Input,
  Heading,
  Text,
  VStack,
  Alert, // v3 compound Alert
  Field, // v3 form helper
} from "@chakra-ui/react";

import { AuthContext } from "@/app/providers/AuthProvider";
import { configureAmplify } from "@/lib/amplify";
import CustomPINInput from "@/components/CustomPINInput";

import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";

/*

login scenarios
- cognito username exists
  - authenticator status = 99  (authenticator is not verified)
  - authenticator status = 1 username is random, automatically created
  - authenticator status = 2  username is valid, normal signup
  - email not verified => has to verify email first

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
  console.log("ROUTER REDIRECT ", redirect);
  const { user, loaded, setUser } = useContext(AuthContext);
  const {
    signIn,
    confirmSignIn,
    getJWTIdToken,
    isLoggedIn,
    setLoginName,
    setKnowledgebaseId,
  } = useStore(
    useShallow((state) => ({
      signIn: state.signIn,
      confirmSignIn: state.confirmSignIn,
      getJWTIdToken: state.getJWTIdToken,
      isLoggedIn: state.isLoggedIn,
      setLoginName: state.setLoginName,
      setKnowledgebaseId: state.setKnowledgebaseId,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      username: "",
      loginName: "",
      isUsernameError: false,
      isEmailError: false,
      usernameError: "",
      otpValidated: false,
      nextDisabled: true,
      knowledgebaseId: "",
    }
  );

  //const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const effectCalled = useRef(false);

  const verify = useCallback(
    async (code) => {
      console.log("VERIFY CODE ", code);
      setLoginName(state.loginName);
      const signInResponse = await signIn(state.username);
      console.log("SIGN IN RESPONSE ", signInResponse);
      if (signInResponse) {
        // include loginType...
        const confirmSignInResponse = await confirmSignIn(code);
        if (confirmSignInResponse) {
          console.log("LOGIN SUCCESS");

          const { tokens } = await fetchAuthSession();
          const idToken = tokens.idToken.payload;
          const cognitoId = idToken["cognito:username"];
          let knowledgebaseId = idToken["custom:knowledgebaseId"] || "";

          if (!knowledgebaseId) {
            console.log("No knowledgebaseId in token, fetching from API");
            const res = await fetch(
              `/api/cognito-user-knowledgebase?cognitoId=${cognitoId}`
            );
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              knowledgebaseId = data[0].knowledgebaseId;
              console.log("Fetched knowledgebaseId:", knowledgebaseId);

              await updateUserProfile({
                "custom:knowledgebaseId": knowledgebaseId,
              });
              console.log("Updated Cognito custom:knowledgebaseId");
            }
          }

          if (knowledgebaseId) {
            setKnowledgebaseId(knowledgebaseId);
          }
        } else {
          console.log("LOGIN CONFIRM FAILED ", confirmSignInResponse);
          setError("Invalid PIN code, try again");
          return false;
        }
      } else {
        console.log("LOGIN SIGNIN FAILED ");
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
        const res = await fetch(`/api/get-cognito-user?username=${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        
        console.log("COGNITO USER DATA:", data);
        
        if (data.error) {
          console.log("User not found in Cognito:", data.error);
          setError("User not found");
          return false;
        }
        
        if (data.user) {
          console.log("Found Cognito user:", data.user);
          setState({ username: user });
          return true;
        }
        
        setError("User not found");
        return false;
      } catch (error) {
        console.error("Error checking user:", error);
        setError("Error checking user");
        return false;
      }
    },
    []
  );

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
        {/* 
      {error && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Login error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      
      )} */}
        <Steps.Root
          count={2}
          step={page}
          onStepChange={async (e) => {
            if (e.step === 1) {
              setIsBusy(true);
              const isValid = await checkUser(state.loginName);
              if (isValid) {
                setIsBusy(false);
                setPage(e.step);
              }
            } else {
              setError("");
              setIsBusy(false);
              setPage(e.step);
            }
          }}
        >
          <Steps.List>
            <Steps.Item key={"index-1"} index={0}>
              <Steps.Indicator />
              <Steps.Separator />
            </Steps.Item>

            <Steps.Item key={"index-2"} index={1}>
              <Steps.Indicator />
              <Steps.Separator />
            </Steps.Item>
          </Steps.List>

          <Steps.Content key={"index-1"} index={0}>
            <Box w="100%" h="200px" rounded="lg" fontSize="2.5rem">
              <VStack spacing={4} align="stretch">
                <Field.Root invalid={!!error}>
                  <Field.RequiredIndicator />
                  <Field.Label>Username</Field.Label>
                  <Input
                    value={state.loginName}
                    onChange={(e) => setState({ loginName: e.target.value })}
                    autoComplete="username"
                  />
                  {error ? (
                    <Field.ErrorText>{error}</Field.ErrorText>
                  ) : (
                    <Field.HelperText>This is a helper text</Field.HelperText>
                  )}
                </Field.Root>
              </VStack>
            </Box>
          </Steps.Content>

          <Steps.Content key={"index-2"} index={1}>
            <Box w="100%" h="200px" rounded="lg" fontSize="2.5rem">
              <Field.Root invalid={!!error}>
                <Field.RequiredIndicator />
                <Field.Label>Enter PIN</Field.Label>
                <CustomPINInput
                  verify={verify}
                  isBusy={isBusy}
                  setIsBusy={setIsBusy}
                  reset={() => {
                    setError("");
                  }}
                />

                {error ? (
                  <Field.ErrorText>{error}</Field.ErrorText>
                ) : (
                  <Field.HelperText>
                    Enter your authenticator PIN code
                  </Field.HelperText>
                )}
              </Field.Root>
            </Box>
          </Steps.Content>
          <ButtonGroup size="sm" variant="outline">
            {page > 0 && (
              <Steps.PrevTrigger asChild>
                <Button>Back</Button>
              </Steps.PrevTrigger>
            )}
            {page === 0 && (
              <Steps.NextTrigger asChild>
                <Button loading={isBusy} loadingText="Checking...">
                  Next
                </Button>
              </Steps.NextTrigger>
            )}
            {page === 1 && (
              <Steps.NextTrigger asChild>
                <Button
                  loading={isBusy}
                  loadingText="Verifying..."
                  disabled={!state.otpValidated}
                >
                  Verify
                </Button>
              </Steps.NextTrigger>
            )}
          </ButtonGroup>
        </Steps.Root>
      </Box>
    </AbsoluteCenter>
  );
}
