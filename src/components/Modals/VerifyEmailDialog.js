import { Dialog, Button, Text, VStack } from "@chakra-ui/react";
import CustomPINInput from "@/components/CustomPINInput";
import { UI_TEXT } from "@/lib/uiStrings";

export default function VerifyEmailDialog({ 
  isOpen, 
  onClose, 
  verifyCode, 
  isBusy, 
  setIsBusy, 
  onResendCode 
}) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      placement="top"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mt="1.75rem">
          <Dialog.Header>
            <Dialog.Title>{UI_TEXT.account.verifyEmail}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack gap="4">
              <Text>{UI_TEXT.account.enterVerificationCode}</Text>
              <CustomPINInput
                verify={verifyCode}
                isBusy={isBusy}
                setIsBusy={setIsBusy}
                reset={() => {}}
              />
            </VStack>
          </Dialog.Body>
          <Dialog.Footer gap="20px">
            <Button variant="outline" onClick={onResendCode}>
              {UI_TEXT.account.resendCode}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {UI_TEXT.general.cancel}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
