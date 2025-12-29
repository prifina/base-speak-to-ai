"use client";

import { Dialog, Button, Text, VStack, Box, QrCode, Flex, IconButton } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { UI_TEXT } from "@/lib/uiStrings";
import { LuCopy, LuCheck } from "react-icons/lu";
import CustomPINInput from "@/components/CustomPINInput";
import HOTP from "@/utils/HOTP";

function base32Encode(input) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let output = "";
  let v = 0;
  let vBits = 0;

  for (let i = 0; i < input.length; i++) {
    v <<= 8;
    v += input.charCodeAt(i);
    vBits += 8;

    while (vBits >= 5) {
      output += alphabet[(v >>> (vBits - 5)) & 31];
      vBits -= 5;
    }
  }

  if (vBits > 0) {
    v <<= 5 - vBits;
    output += alphabet[v & 31];
  }

  while (output.length % 8 !== 0) {
    output += "=";
  }

  return output;
}

function getTotpUrl(secretRaw, issuerRaw, accountRaw) {
  const issuer = encodeURIComponent(issuerRaw);
  const accountName = encodeURIComponent(accountRaw);
  const secret = base32Encode(secretRaw).replace(/=+$/, "");

  return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
}

function generateSecureRandomString(length = 16) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  const possibleCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let result = "";
  const charactersLength = possibleCharacters.length;
  for (let i = 0; i < length; i++) {
    result += possibleCharacters.charAt(array[i] % charactersLength);
  }
  return result;
}

export default function ConnectAuthenticatorDialog({ 
  isOpen, 
  onClose, 
  username,
  onNext,
  isReconnect = false
}) {
  const effectCalled = useRef(false);
  const sessionSecretRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [isBusy, setIsBusy] = useState(false);
  const [qrData, setQrData] = useState({
    encodedSecret: "",
    otpauth: "",
    otpSecret: ""
  });

  useEffect(() => {
    function init() {
      effectCalled.current = true;
      
      let secret;
      if (sessionSecretRef.current && !isReconnect) {
        secret = sessionSecretRef.current;
      } else {
        secret = generateSecureRandomString();
        sessionSecretRef.current = secret;
      }
      
      const encoded = base32Encode(secret);
      const url = getTotpUrl(secret, "Prifina", username);
      setQrData({
        encodedSecret: encoded,
        otpauth: url,
        otpSecret: secret
      });
      setStep(1);
    }
    if (!effectCalled.current && isOpen) {
      init();
    }
  }, [isOpen, username, isReconnect]);

  const handleCopy = async () => {
    const code = qrData.encodedSecret.replace(/=+$/, "");
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    setStep(2);
  };

  const verifyCode = async (code) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const counter = Math.floor(currentTime / 30);
    
    const validCodes = [];
    for (let i = -1; i <= 1; i++) {
      const totp = await HOTP.generateHOTP(qrData.otpSecret, counter + i);
      validCodes.push(totp);
    }
    
    if (validCodes.includes(code)) {
      await onNext(qrData.otpSecret, qrData.encodedSecret);
      return true;
    }
    return false;
  };

  const resetPin = () => {
    setStep(1);
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      placement="top"
      size="lg"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mt="1.75rem">
          <Dialog.Header>
            <Dialog.Title>
              {step === 1 ? UI_TEXT.account.mfa.scanQrCode : UI_TEXT.account.mfa.verifyCode}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {step === 1 ? (
            <VStack gap="6">
              <Text textAlign="center" color="gray.600">
                {UI_TEXT.account.mfa.openAuthenticator} <strong>{UI_TEXT.account.mfa.authenticatorApp}</strong> {UI_TEXT.account.mfa.scanInstruction}
              </Text>

              <Box w="320px" maxW="100%">
                <QrCode.Root value={qrData.otpauth} size="full">
                  <QrCode.Frame>
                    <QrCode.Pattern />
                  </QrCode.Frame>
                </QrCode.Root>
              </Box>

              <Text textAlign="center" color="gray.600">
                {UI_TEXT.account.mfa.manualSetupInstruction} <strong>{UI_TEXT.account.mfa.connectManually}</strong> {UI_TEXT.account.mfa.manualSetupInstructionEnd}
              </Text>

              <Flex
                w="100%"
                borderRadius="4.8px"
                border="1px solid"
                borderColor="gray.300"
                p="10px"
                align="center"
                justify="space-between"
                gap="2"
              >
                <Text fontWeight="600" flex="1" textAlign="center">
                  {qrData.encodedSecret.replace(/=+$/, "")}
                </Text>
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  aria-label="Copy code"
                >
                  {copied ? <LuCheck /> : <LuCopy />}
                </IconButton>
              </Flex>
            </VStack>
            ) : (
              <VStack gap="6">
                <Text textAlign="center" color="gray.600">
                  {UI_TEXT.account.mfa.enterVerificationCode}
                </Text>
                <CustomPINInput
                  verify={verifyCode}
                  isBusy={isBusy}
                  setIsBusy={setIsBusy}
                  reset={resetPin}
                />
              </VStack>
            )}
          </Dialog.Body>
          <Dialog.Footer gap="20px">
            <Button variant="outline" onClick={onClose}>
              {UI_TEXT.general.cancel}
            </Button>
            {step === 1 && (
              <Button colorPalette="blue" onClick={handleNext}>
                {UI_TEXT.account.mfa.next}
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
