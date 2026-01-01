"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "@chakra-ui/react";
import ReCAPTCHA from "react-google-recaptcha";
import { UI_TEXT } from "@/lib/uiStrings";
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
import { verifyEmailAttribute, requestEmailVerificationCode } from "@/lib/userAttributes";

export default function SignupPage() {
  const router = useRouter();
  const captchaRef = useRef();
  const { usernameAvailable } = useStore(
    useShallow((state) => ({
      usernameAvailable: state.usernameAvailable,
    }))
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValidated, setCaptchaValidated] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cognitoUsername, setCognitoUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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
        usernameAvailable
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

  const onCaptchaChange = (token) => {
    console.log("Captcha token:", token);

    fetch("/api/verify-captcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    }).then(async (res) => {
      console.log("STATUS ", res.status, res.statusText);
      const check = await res.json();
      if (res.status === 200) {
        setCaptchaValidated(true);
      } else {
        toaster.create({
          title: "CAPTCHA Check",
          type: "error",
          description: check.message,
        });
        captchaRef.current.reset();
        setCaptchaValidated(false);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const formErrors = validateFormData(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!captchaValidated) {
      toaster.create({
        title: UI_TEXT.signup.messages.captchaRequired,
        type: "error",
        description: UI_TEXT.signup.messages.completeCaptcha,
      });
      return;
    }

    // Check for validation errors
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
      // Generate random password since we're not using password auth
      const randomPassword = Math.random().toString(36).slice(-12) + "A1!";
      // Generate UUID for Cognito username
      const cognitoUserId = uuidv4();
      
      console.log("SIGNUP: Starting signup process");
      console.log("SIGNUP: Form data:", formData);
      console.log("SIGNUP: Generated password:", randomPassword);
      console.log("SIGNUP: Generated Cognito username:", cognitoUserId);
      
      const signUpParams = {
        username: cognitoUserId,
        password: randomPassword,
        options: {
          userAttributes: {
            given_name: formData.firstName,
            family_name: formData.lastName,
            name: formData.username, // preferred_username goes in name
            email: formData.email,
            "custom:authenticator_status": "2",
          },
        },
      };
      
      console.log("SIGNUP: SignUp parameters:", signUpParams);
      
      const result = await signUp(signUpParams);
      
      console.log("SIGNUP: SignUp result:", result);
      console.log("SIGNUP: User ID:", result.userId);
      console.log("SIGNUP: Next step:", result.nextStep);
      
      setCognitoUsername(result.userId);
      setTempPassword(randomPassword);
      
      // Sign in with the random password to enable email verification
      console.log("SIGNUP: Signing in with temporary password");
      await signIn({
        username: cognitoUserId,
        password: randomPassword,
      });
      
      // Request email verification code
      console.log("SIGNUP: Requesting email verification code");
      await requestEmailVerificationCode();
      
      setShowConfirmation(true);
      
      toaster.create({
        title: UI_TEXT.signup.messages.accountCreated,
        type: "success",
        description: UI_TEXT.signup.messages.checkEmail,
      });
    } catch (error) {
      console.error("SIGNUP ERROR: Full error object:", error);
      console.error("SIGNUP ERROR: Error name:", error.name);
      console.error("SIGNUP ERROR: Error message:", error.message);
      console.error("SIGNUP ERROR: Error code:", error.code);
      toaster.create({
        title: UI_TEXT.signup.messages.signupFailed,
        type: "error",
        description: error.message || UI_TEXT.signup.messages.createAccountFailed,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignup = async (code) => {
    setIsVerifying(true);
    try {
      console.log("VERIFY: Starting email verification process");
      console.log("VERIFY: Verification code:", code);
      
      const result = await verifyEmailAttribute(code);
      
      console.log("VERIFY: Verification result:", result);
      
      toaster.create({
        title: UI_TEXT.signup.messages.emailVerified,
        type: "success",
        description: UI_TEXT.signup.messages.accountVerified,
      });
      
      // Sign out before redirecting to login
      console.log("VERIFY: Signing out before redirect");
      await signOut();
      
      router.push("/login");
      return true;
    } catch (error) {
      console.error("VERIFY ERROR: Full error object:", error);
      console.error("VERIFY ERROR: Error name:", error.name);
      console.error("VERIFY ERROR: Error message:", error.message);
      console.error("VERIFY ERROR: Error code:", error.code);
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
              <VStack spacing={4} align="stretch">
                <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                  <Field.Root invalid={!!errors.firstName} flex={{ base: 1, sm: 0.4 }}>
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

                  <Field.Root invalid={!!errors.lastName} flex={{ base: 1, sm: 0.6 }}>
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
                  />
                  {errors.email ? (
                    <Field.ErrorText>{errors.email}</Field.ErrorText>
                  ) : (
                    <Field.HelperText>
                      {UI_TEXT.account.emailHelper}
                    </Field.HelperText>
                  )}
                </Field.Root>

                <Flex justifyContent="center" mt={4}>
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
                    onChange={onCaptchaChange}
                  />
                </Flex>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  mt={4}
                  loading={isLoading}
                  loadingText={UI_TEXT.signup.loadingText}
                  disabled={!captchaValidated}
                >
                  {UI_TEXT.signup.createButton}
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" mt={4} fontSize="sm">
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
              {UI_TEXT.signup.verification.description.replace("{email}", formData.email)}
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
                  <Button variant="outline" onClick={() => setShowConfirmation(false)}>
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
