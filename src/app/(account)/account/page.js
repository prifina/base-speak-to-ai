"use client";

import { useContext, useEffect, useRef, useReducer, useCallback } from "react";
import { Box, Text, Flex, VStack, Input, Field, Badge, Button, Separator } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { Loading } from "@/components/Loading";
import { UI_TEXT } from "@/lib/uiStrings";
import { getUserAttributes, updateUserProfile, verifyEmailAttribute, requestEmailVerificationCode } from "@/lib/userAttributes";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/lib/sessionStore";
import SaveButton from "@/components/SaveButton";
import { toaster } from "@/components/ui/toaster";
import { isEmail } from "@/utils";
import VerifyEmailDialog from "@/components/Modals/VerifyEmailDialog";
import ConnectAuthenticatorDialog from "@/components/Modals/ConnectAuthenticatorDialog";
import { validateUsername, validateEmail } from "@/lib/validation";
import { useAuthFetch } from "@/lib/useAuthFetch";

export default function AccountPage() {
  const { loaded: authLoaded } = useContext(AuthContext);
  const effectCalled = useRef(false);
  const authFetch = useAuthFetch();
  const { usernameAvailable } = useStore(
    useShallow((state) => ({
      usernameAvailable: state.usernameAvailable,
    }))
  );

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      loading: true,
      saving: false,
      givenName: "",
      familyName: "",
      email: "",
      preferredUsername: "",
      emailVerified: false,
      authenticatorStatus: "",
      showUsername: true,
      usernameError: "",
      emailError: "",
      initialData: {},
      showVerificationDialog: false,
      verifying: false,
      emailChanged: false,
      showAuthenticatorDialog: false,
    }
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const attributes = await getUserAttributes();
        const isUsernameNotCreated =
          attributes.authenticatorStatus === "1" &&
          attributes.name === attributes.preferredUsername;
        const initialData = {
          givenName: attributes.givenName,
          familyName: attributes.familyName,
          email: attributes.email,
          preferredUsername: isUsernameNotCreated ? "" : attributes.preferredUsername,
        };
        setState({
          ...initialData,
          emailVerified: attributes.emailVerified,
          authenticatorStatus: attributes.authenticatorStatus || "1",
          showUsername: true,
          initialData,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch user attributes:", error);
        setState({ loading: false });
      }
    }

    if (!effectCalled.current && authLoaded) {
      fetchData();
      effectCalled.current = true;
    }
  }, [authLoaded]);

  const handleEmailChange = useCallback(
    async (value) => {
      setState({ email: value });
      if (value) {
        const error = await validateEmail(value, state.initialData.email);
        setState({ emailError: error });
      } else {
        setState({ emailError: "" });
      }
    },
    [state.initialData.email]
  );

  const handleUsernameChange = useCallback(
    async (value) => {
      setState({ preferredUsername: value });
      if (value) {
        const error = await validateUsername(value, state.initialData.preferredUsername, usernameAvailable);
        setState({ usernameError: error });
      } else {
        setState({ usernameError: "" });
      }
    },
    [state.initialData.preferredUsername, usernameAvailable]
  );

  const hasChanges =
    state.givenName !== state.initialData.givenName ||
    state.familyName !== state.initialData.familyName ||
    state.email !== state.initialData.email ||
    state.preferredUsername !== state.initialData.preferredUsername;

  const hasErrors = !!state.usernameError || !!state.emailError;

  const handleSave = async () => {
    setState({ saving: true });
    try {
      const emailChanged = state.email !== state.initialData.email;
      
      const updates = {};
      if (state.givenName !== state.initialData.givenName) {
        updates.givenName = state.givenName;
      }
      if (state.familyName !== state.initialData.familyName) {
        updates.familyName = state.familyName;
      }
      if (state.preferredUsername !== state.initialData.preferredUsername) {
        updates.preferredUsername = state.preferredUsername;
      }
      if (emailChanged) {
        updates.email = state.email;
      }

      await updateUserProfile(updates);

      if (emailChanged) {
        await requestEmailVerificationCode();
        const newData = {
          givenName: state.givenName,
          familyName: state.familyName,
          email: state.email,
          preferredUsername: state.preferredUsername,
        };
        setState({ 
          saving: false, 
          initialData: newData,
          emailVerified: false,
          showVerificationDialog: true,
        });
        toaster.create({
          title: UI_TEXT.account.verificationCodeSent,
          type: "success",
        });
      } else {
        const newData = {
          givenName: state.givenName,
          familyName: state.familyName,
          email: state.email,
          preferredUsername: state.preferredUsername,
        };
        setState({ saving: false, initialData: newData });
        toaster.create({
          title: UI_TEXT.account.saveSuccess,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setState({ saving: false });
      toaster.create({
        title: UI_TEXT.account.saveFailed,
        type: "error",
      });
    }
  };

  const verifyCode = useCallback(async (code) => {
    try {
      await verifyEmailAttribute(code);
      setState({ 
        emailVerified: true, 
        showVerificationDialog: false,
      });
      toaster.create({
        title: UI_TEXT.account.verificationSuccess,
        type: "success",
      });
      return true;
    } catch (error) {
      console.error("Verification error:", error);
      toaster.create({
        title: UI_TEXT.account.verificationFailed,
        type: "error",
      });
      return false;
    }
  }, []);

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

  const handleVerifyEmail = async () => {
    try {
      await requestEmailVerificationCode();
      setState({ showVerificationDialog: true });
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

  const handleAuthenticatorSuccess = async (otpSecret, encodedSecret) => {
    try {
      const encodedBase64 = btoa(otpSecret);
      await updateUserProfile({
        "custom:authenticator_status": "0",
        "custom:authenticator_secret": encodedBase64,
      });
      
      const attributes = await getUserAttributes();
      setState({ 
        showAuthenticatorDialog: false,
        authenticatorStatus: attributes.authenticatorStatus
      });
      toaster.create({
        title: UI_TEXT.account.mfa.setupSuccess,
        type: "success",
      });
    } catch (error) {
      console.error("Authenticator setup error:", error);
      toaster.create({
        title: UI_TEXT.account.mfa.setupFailed,
        type: "error",
      });
    }
  };

  if (!authLoaded || state.loading) {
    return <Loading />;
  }

  return (
    <Flex flexDir="column" gap="40px" p="28px">
      <Box pl={{ base: "42px", md: "0" }}>
        <Text textStyle="pageTitle">{UI_TEXT.account.sectionTitle}</Text>
      </Box>
      <VStack align="stretch" gap="6" maxW="500px">
        <Field.Root>
          <Field.Label>{UI_TEXT.account.givenName}</Field.Label>
          <Input
            value={state.givenName}
            onChange={(e) => setState({ givenName: e.target.value })}
            variant="flushed"
            disabled={!state.emailVerified}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>{UI_TEXT.account.familyName}</Field.Label>
          <Input
            value={state.familyName}
            onChange={(e) => setState({ familyName: e.target.value })}
            variant="flushed"
            disabled={!state.emailVerified}
          />
        </Field.Root>

        <Field.Root invalid={!!state.usernameError}>
          <Field.Label>{UI_TEXT.account.username}</Field.Label>
          <Input
            value={state.preferredUsername}
            onChange={(e) => handleUsernameChange(e.target.value)}
            variant="flushed"
            disabled={!state.emailVerified}
          />
          {state.usernameError ? (
            <Field.ErrorText>{state.usernameError}</Field.ErrorText>
          ) : (
            <Field.HelperText>{UI_TEXT.account.usernameHelper}</Field.HelperText>
          )}
        </Field.Root>

        <Field.Root invalid={!!state.emailError}>
          <Field.Label>{UI_TEXT.account.email}</Field.Label>
          <Input
            value={state.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            variant="flushed"
          />
          {state.emailError ? (
            <Field.ErrorText>{state.emailError}</Field.ErrorText>
          ) : state.email === state.initialData.email && !state.emailVerified ? (
            <Flex mt="2" gap="2" align="center">
              <Badge colorPalette="gray">{UI_TEXT.account.emailNotVerified}</Badge>
            </Flex>
          ) : state.email === state.initialData.email && state.emailVerified ? (
            <Flex mt="2">
              <Badge colorPalette="green">{UI_TEXT.account.emailVerified}</Badge>
            </Flex>
          ) : null}
        </Field.Root>

        {!state.emailVerified && (
          <Box>
            <Text fontSize="sm" color="gray.600">
              {UI_TEXT.account.emailMustBeVerified}
            </Text>
          </Box>
        )}

        <Box mt="20px">
          {state.emailVerified ? (
            <SaveButton
              onClick={handleSave}
              loading={state.saving}
              disabled={state.saving || !hasChanges || hasErrors}
            />
          ) : (
            <Button onClick={handleVerifyEmail} colorPalette="blue">
              {UI_TEXT.account.verifyEmail}
            </Button>
          )}
        </Box>
      </VStack>

      <Separator />

      <VStack align="stretch" gap="4" maxW="500px">
        <Text fontSize="lg" fontWeight="semibold">
          {UI_TEXT.account.mfa.title}
        </Text>
        <Box>
          <Button 
            colorPalette="blue" 
            variant="outline"
            onClick={() => setState({ showAuthenticatorDialog: true })}
          >
            {state.authenticatorStatus === "0"
              ? UI_TEXT.account.mfa.reconnectAuthenticator
              : UI_TEXT.account.mfa.connectAuthenticator}
          </Button>
        </Box>
      </VStack>

      <VerifyEmailDialog
        isOpen={state.showVerificationDialog}
        onClose={() => setState({ showVerificationDialog: false })}
        verifyCode={verifyCode}
        isBusy={state.verifying}
        setIsBusy={(busy) => setState({ verifying: busy })}
        onResendCode={handleResendCode}
      />

      <ConnectAuthenticatorDialog
        isOpen={state.showAuthenticatorDialog}
        onClose={() => setState({ showAuthenticatorDialog: false })}
        username={state.preferredUsername}
        onNext={handleAuthenticatorSuccess}
        isReconnect={state.authenticatorStatus === "0"}
      />
    </Flex>
  );
}
