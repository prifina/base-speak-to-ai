"use client";

import { useState, useRef } from "react";
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
} from "@chakra-ui/react";
import ReCAPTCHA from "react-google-recaptcha";
import { UI_TEXT } from "@/lib/uiStrings";
import { toaster } from "@/components/ui/toaster";

export default function SignupPage() {
  const router = useRouter();
  const captchaRef = useRef();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValidated, setCaptchaValidated] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
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
    if (!captchaValidated) {
      toaster.create({
        title: "Verification Required",
        type: "error",
        description: "Please complete the CAPTCHA verification",
      });
      return;
    }
    setIsLoading(true);
    // TODO: Implement signup logic
    console.log("Signup data:", formData);
    setIsLoading(false);
  };

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
        <Heading mb={6}>Create your Prifina account</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <Field.Root invalid={!!errors.firstName}>
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

            <Field.Root invalid={!!errors.lastName}>
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

            <Field.Root invalid={!!errors.username} required>
              <Field.Label>
                {UI_TEXT.account.username}
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
                required
              />
              <Field.HelperText>{UI_TEXT.account.usernameHelper}</Field.HelperText>
              {errors.username && (
                <Field.ErrorText>{errors.username}</Field.ErrorText>
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
                autoComplete="email"
                required
              />
              {errors.email && (
                <Field.ErrorText>{errors.email}</Field.ErrorText>
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
              loadingText="Creating account..."
              disabled={!captchaValidated}
            >
              Create Account
            </Button>
          </VStack>
        </form>
        
        <Text textAlign="center" mt={6}>
          Already have an account?{" "}
          <Link color="blue.500" onClick={() => router.push("/login")}>
            Sign in here
          </Link>
        </Text>
      </Box>
    </AbsoluteCenter>
  );
}
