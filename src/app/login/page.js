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
import CustomPINInput from "@/app/_components/CustomPINInput";

import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/about";
  console.log("REDIRECT ", redirect);
  const { user, loaded, setUser } = useContext(AuthContext);
  const {
    api,
    signIn,
    confirmSignIn,
    getJWTIdToken,
    usernameAvailable,
    isLoggedIn,
    setLoginName,
  } = useStore(
    useShallow((state) => ({
      api: state.api,
      signIn: state.signIn,
      confirmSignIn: state.confirmSignIn,
      getJWTIdToken: state.getJWTIdToken,
      usernameAvailable: state.usernameAvailable,
      isLoggedIn: state.isLoggedIn,
      setLoginName: state.setLoginName,
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
      console.log("CODE ", code);
      setLoginName(state.loginName);
      //state.username
      const signInResponse = await signIn(state.username);
      console.log("SIGN IN RESPONSE ", signInResponse);
      if (signInResponse) {
        const confirmSignInResponse = await confirmSignIn(code);
        if (confirmSignInResponse) {
          console.log("LOGIN SUCCESS");
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
      /*  console.log("ID TOKEN ", getJWTIdToken());
      const res = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: getJWTIdToken() }),
      });
      if (!res.ok) {
        throw new Error("Failed to set auth cookie");
      } else {
        router.replace(redirect);
      } */

      // should not be here...
      //await new Promise((resolve) => setTimeout(resolve, 2000));
      //setError("Invalid PIN code, try again");
      //return false;
    },
    [
      signIn,
      confirmSignIn,
      state.username,
      redirect,
      router,
      state.loginName,
      setLoginName,
    ]
  );

  const checkUser = useCallback(
    async (user) => {
      const available = await usernameAvailable(user);
      if (!available) {
        return true;
      }

      const res = await fetch(`/api/auth/check-login?user=${user}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!data.login?.knowledgebaseId) {
        setError("User not found");
        return false;
      }

      setState({
        knowledgebaseId: data.login.knowledgebaseId,
        username: data.login.username,
      });
      return true;
    },
    [usernameAvailable]
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
