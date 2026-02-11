"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AbsoluteCenter,
  Box,
  Heading,
  VStack,
  Button,
  Input,
  Field,
  Link,
  Text,
  Flex,
  Image,
  Checkbox,
} from "@chakra-ui/react";
import { UI_TEXT } from "@/lib/uiStrings";
import { EVALS } from "@/lib/appConfig";
import { toaster } from "@/components/ui/toaster";
import {
  validateUsername,
  validateEmail,
  validateFormData,
} from "@/lib/validation";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import { signUp, signIn, signOut } from "aws-amplify/auth";
import CustomPINInput from "@/components/CustomPINInput";
import { v4 as uuidv4 } from "uuid";
import {
  verifyEmailAttribute,
  requestEmailVerificationCode,
} from "@/lib/userAttributes";
import AntiBotFields from "@/lib/antibot/AntiBotFields";
import { configureAmplify } from "@/lib/amplify";

function SignupFormContent({ token }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usernameAvailable } = useStore(
    useShallow((state) => ({
      usernameAvailable: state.usernameAvailable,
    })),
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cognitoUsername, setCognitoUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasVerifiedEmail, setHasVerifiedEmail] = useState(false);
  const [knowledgebaseId, setKnowledgebaseId] = useState(null);

  useEffect(() => {
    configureAmplify();
  }, []);

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    const participantId = searchParams.get("participantId");

    if (eventId && participantId) {
      fetch(
        `/api/get-participant?eventId=${eventId}&participantId=${encodeURIComponent(participantId)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const participant = data.participant;
          if (participant) {
            setFormData({
              firstName: participant.firstName || "",
              lastName: participant.lastName || "",
              username: "",
              email: participant.userEmail || "",
            });
            if (participant.userEmail) {
              setHasVerifiedEmail(true);
            }
            if (participant.knowledgebaseId) {
              setKnowledgebaseId(participant.knowledgebaseId);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching participant:", error);
        });
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUsernameBlur = useCallback(async () => {
    if (formData.username) {
      const error = await validateUsername(
        formData.username,
        "",
        usernameAvailable,
      );
      setErrors((prev) => ({ ...prev, username: error }));
    }
  }, [formData.username, usernameAvailable]);

  const handleEmailBlur = useCallback(async () => {
    if (formData.email) {
      const error = await validateEmail(formData.email);
      setErrors((prev) => ({ ...prev, email: error }));
    }
  }, [formData.email]);

  const handleUsernameKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleUsernameBlur();
    }
  };

  const handleEmailKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleEmailBlur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateFormData(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!agreedToTerms) {
      toaster.create({
        title: "Terms Agreement Required",
        type: "error",
        description:
          "Please agree to the Terms and Privacy Policy to continue.",
      });
      return;
    }

    if (Object.values(errors).some((error) => error)) {
      toaster.create({
        title: UI_TEXT.signup.messages.validationError,
        type: "error",
        description: UI_TEXT.signup.messages.fixErrors,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate antibot fields
      const formDataObj = new FormData(e.target);
      const antibotRes = await fetch("/api/validate-antibot", {
        method: "POST",
        body: formDataObj,
      });
      const antibotData = await antibotRes.json();

      if (!antibotData.ok) {
        toaster.create({
          title: "Validation Failed",
          type: "error",
          description: "Please try again.",
        });
        setIsLoading(false);
        return;
      }

      const randomPassword = Math.random().toString(36).slice(-12) + "A1!";
      const cognitoUserId = uuidv4();

      const signUpParams = {
        username: cognitoUserId,
        password: randomPassword,
        options: {
          userAttributes: {
            given_name: formData.firstName,
            family_name: formData.lastName,
            name: formData.username,
            email: formData.email,
            "custom:authenticator_status": "2",
          },
        },
      };

      const result = await signUp(signUpParams);

      setCognitoUsername(result.userId);
      setTempPassword(randomPassword);

      await signIn({
        username: cognitoUserId,
        password: randomPassword,
      });

      await requestEmailVerificationCode();

      setShowConfirmation(true);

      toaster.create({
        title: UI_TEXT.signup.messages.accountCreated,
        type: "success",
        description: UI_TEXT.signup.messages.checkEmail,
      });
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      toaster.create({
        title: UI_TEXT.signup.messages.signupFailed,
        type: "error",
        description:
          error.message || UI_TEXT.signup.messages.createAccountFailed,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignup = async (code) => {
    setIsVerifying(true);
    try {
      const result = await verifyEmailAttribute(code);

      toaster.create({
        title: UI_TEXT.signup.messages.emailVerified,
        type: "success",
        description: UI_TEXT.signup.messages.accountVerified,
      });

      await signOut();

      let loginUrl = "/login";
      const params = new URLSearchParams();
      if (formData.username) {
        params.append("username", formData.username);
      }
      if (knowledgebaseId) {
        params.append("knowledgebaseId", knowledgebaseId);
      }
      if (params.toString()) {
        loginUrl += `?${params.toString()}`;
      }

      router.push(loginUrl);
      return true;
    } catch (error) {
      console.error("VERIFY ERROR:", error);
      toaster.create({
        title: UI_TEXT.signup.messages.verificationFailed,
        type: "error",
        description: error.message || UI_TEXT.signup.messages.invalidCode,
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await requestEmailVerificationCode();
      toaster.create({
        title: UI_TEXT.account.verificationCodeSent,
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Failed to send verification code",
        type: "error",
      });
    }
  };

  return (
    <AbsoluteCenter>
      <Box
        w={{ base: "90%", md: "520px" }}
        maxW="520px"
        mx="auto"
        mt={5}
        px={{ base: 4, md: 8 }}
        py={3}
        borderWidth="1px"
        borderRadius="lg"
      >
        {!showConfirmation ? (
          <>
            <Heading mb={4} textAlign="center">
              {UI_TEXT.signup.title}
            </Heading>
            <Flex justifyContent="center" mb={4}>
              <Image
                src="/assets/data-center.svg"
                alt="Data Center"
                width="160px"
                height="auto"
              />
            </Flex>
            <form onSubmit={handleSubmit}>
              <VStack spacing={3} align="stretch">
                <AntiBotFields token={token} action="signup_form" />

                <Flex gap={3} direction={{ base: "column", sm: "row" }}>
                  <Field.Root
                    invalid={!!errors.firstName}
                    flex={{ base: 1, sm: 0.4 }}
                  >
                    <Field.Label>{UI_TEXT.account.givenName}</Field.Label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <Field.ErrorText>{errors.firstName}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root
                    invalid={!!errors.lastName}
                    flex={{ base: 1, sm: 0.6 }}
                  >
                    <Field.Label>{UI_TEXT.account.familyName}</Field.Label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <Field.ErrorText>{errors.lastName}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Flex>

                <Field.Root invalid={!!errors.username} required>
                  <Field.Label>
                    {UI_TEXT.account.username}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={handleUsernameBlur}
                    onKeyDown={handleUsernameKeyDown}
                    autoComplete="username"
                    required
                  />
                  {errors.username ? (
                    <Field.ErrorText>{errors.username}</Field.ErrorText>
                  ) : (
                    <Field.HelperText>
                      {UI_TEXT.account.usernameHelper}
                    </Field.HelperText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.email} required>
                  <Field.Label>
                    {UI_TEXT.account.email}
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    onKeyDown={handleEmailKeyDown}
                    autoComplete="email"
                    required
                    disabled={hasVerifiedEmail}
                  />
                  {errors.email ? (
                    <Field.ErrorText>{errors.email}</Field.ErrorText>
                  ) : hasVerifiedEmail ? (
                    <Field.HelperText color="green.600">
                      Email verified from event registration
                    </Field.HelperText>
                  ) : (
                    <Field.HelperText>
                      {UI_TEXT.account.emailHelper}
                    </Field.HelperText>
                  )}
                </Field.Root>

                <Flex align="start" gap={3} mt={2}>
                  <Checkbox.Root
                    checked={agreedToTerms}
                    onCheckedChange={(e) => setAgreedToTerms(!!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    cursor="pointer"
                    lineHeight="1.4"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    {UI_TEXT.signup.termsText}{" "}
                    <Link
                      href={EVALS.termsOfUse}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      textDecoration="underline"
                      _hover={{ color: "blue.700" }}
                    >
                      {UI_TEXT.signup.termsLink}
                    </Link>{" "}
                    {UI_TEXT.signup.andText}{" "}
                    <Link
                      href={EVALS.privacyPolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      textDecoration="underline"
                      _hover={{ color: "blue.700" }}
                    >
                      {UI_TEXT.signup.privacyLink}
                    </Link>
                  </Text>
                </Flex>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  mt={2}
                  loading={isLoading}
                  loadingText={UI_TEXT.signup.loadingText}
                  disabled={!agreedToTerms}
                >
                  {UI_TEXT.signup.createButton}
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" mt={3} fontSize="sm">
              {UI_TEXT.signup.alreadyHaveAccount}{" "}
              <Link color="blue.500" onClick={() => router.push("/login")}>
                {UI_TEXT.signup.signInHere}
              </Link>
            </Text>
          </>
        ) : (
          <>
            <Heading mb={4} textAlign="center">
              {UI_TEXT.signup.verification.title}
            </Heading>
            <Text textAlign="center" mb={6}>
              {UI_TEXT.signup.verification.description.replace(
                "{email}",
                formData.email,
              )}
            </Text>
            <VStack spacing={6}>
              <CustomPINInput
                verify={handleConfirmSignup}
                isBusy={isLoading}
                setIsBusy={setIsLoading}
                reset={() => {}}
              />
              {isVerifying ? (
                <Text textAlign="center" fontSize="sm" color="blue.600">
                  Verifying code...
                </Text>
              ) : (
                <Flex gap={4} wrap="wrap" justify="center">
                  <Button variant="outline" onClick={handleResendCode}>
                    {UI_TEXT.account.resendCode}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                  >
                    {UI_TEXT.signup.verification.goBack}
                  </Button>
                </Flex>
              )}
              <Text textAlign="center" fontSize="sm" color="gray.600">
                {UI_TEXT.signup.verification.didntReceive}
              </Text>
            </VStack>
          </>
        )}
      </Box>
    </AbsoluteCenter>
  );
}

export default function SignupForm({ token }) {
  return (
    <Suspense
      fallback={
        <AbsoluteCenter>
          <Box>Loading...</Box>
        </AbsoluteCenter>
      }
    >
      <SignupFormContent token={token} />
    </Suspense>
  );
}
