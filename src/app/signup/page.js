"use client";

import { useState } from "react";
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
} from "@chakra-ui/react";
import { UI_TEXT } from "@/lib/uiStrings";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

            <Field.Root invalid={!!errors.username}>
              <Field.Label>{UI_TEXT.account.username}</Field.Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="username"
              />
              <Field.HelperText>{UI_TEXT.account.usernameHelper}</Field.HelperText>
              {errors.username && (
                <Field.ErrorText>{errors.username}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.email}>
              <Field.Label>{UI_TEXT.account.email}</Field.Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
              />
              {errors.email && (
                <Field.ErrorText>{errors.email}</Field.ErrorText>
              )}
            </Field.Root>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              mt={4}
              loading={isLoading}
              loadingText="Creating account..."
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
