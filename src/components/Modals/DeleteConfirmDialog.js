import { Dialog, Button, Text } from "@chakra-ui/react";

export default function DeleteConfirmDialog({ isOpen, onClose, fileName, onConfirm }) {
  return (
    <Dialog.Root
      closeOnInteractOutside={false}
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      placement="top"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mt="1.75rem">
          <Dialog.Header fontSize="lg" fontWeight="bold" px="6" pt="6" pb="4">
            Delete {fileName}?
          </Dialog.Header>
          <Dialog.Body px="6" pb="6">
            <Text>
              This action is irreversible and the file will be unrecoverable.
            </Text>
          </Dialog.Body>
          <Dialog.Footer gap="20px" px="6" pb="6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorPalette="red" onClick={onConfirm}>
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
