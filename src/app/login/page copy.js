"use client";

import {
  useState,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession /*, signIn */ } from "aws-amplify/auth";

import {
  Carousel,
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/about";

  const { user, loaded, setUser } = useContext(AuthContext);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      username: "",

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

  const verify = useCallback((code) => {
    console.log("CODE ", code);
    setError("Invalid OTP code, try again");
    return false;
  }, []);

  const checkUser = useCallback(async (user) => {
    const res = await fetch(`/api/auth/check-user?user=${user}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.json();
  }, []);

  useEffect(() => {
    configureAmplify();
  }, []);

  useEffect(() => {
    if (loaded && user) {
      router.replace(redirect);
    }
  }, [loaded, user, redirect, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    //setSubmitting(true);
    setError("");

    try {
      // TODO: actually sign in first with signIn({ username, password })
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();

      const res = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to set auth cookie");
      }

      router.replace(redirect);
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      //setSubmitting(false);
    }
  }

  return (
    <Box maxW="xl" mx="auto" mt={10} p={8} borderWidth="1px" borderRadius="lg">
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
      <Carousel.Root
        slideCount={2}
        maxW="xl"
        mx="auto"
        page={page}
        onPageChange={(e) => {
          checkUser(state.username).then((data) => {
            console.log("PAGE CHECK USER ", data);
            //setError("Error test");
            setPage(e.page);
          });
        }}
      >
        <Carousel.ItemGroup>
          <Carousel.Item key={"index-1"} index={0}>
            <VStack spacing={4} align="stretch">
              <Field.Root invalid={!!error}>
                <Field.RequiredIndicator />
                <Field.Label>Username</Field.Label>
                <Input
                  value={state.username}
                  onChange={(e) => setState({ username: e.target.value })}
                  autoComplete="username"
                />
                {error ? (
                  <Field.ErrorText>{error}</Field.ErrorText>
                ) : (
                  <Field.HelperText>This is a helper text</Field.HelperText>
                )}
              </Field.Root>
            </VStack>
          </Carousel.Item>
          <Carousel.Item key={"index-2"} index={1}>
            <Box w="100%" h="300px" rounded="lg" fontSize="2.5rem">
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
                    Enter your authenticator OTP code
                  </Field.HelperText>
                )}
              </Field.Root>
            </Box>
          </Carousel.Item>
        </Carousel.ItemGroup>

        <Carousel.Control justifyContent="center" gap="4">
          {page > 0 && (
            <Carousel.PrevTrigger asChild>
              <Button>Back</Button>
            </Carousel.PrevTrigger>
          )}
          {page === 0 && (
            <Carousel.NextTrigger asChild>
              <Button>Next</Button>
            </Carousel.NextTrigger>
          )}
        </Carousel.Control>
      </Carousel.Root>
    </Box>
  );
}
