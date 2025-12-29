import {
  Button,
  Box,
  Text,
  CloseButton,
} from "@chakra-ui/react";
import { Dialog } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import CustomTextArea from "../CustomTextArea";
import { LabelInput } from "../LabelInput";
import { UI_TEXT } from "@/lib/uiStrings";

const BasicQuickAdd = ({ isOpen, onClose, save, file = undefined }) => {
  // const [validity, setValidity] = useState({
  //   checkbox: false,
  //   text: false,
  // });

  const baseTitleVal = file === undefined ? "" : file.name;
  const baseDescriptionVal = file === undefined ? "" : file.content;

  const [title, setTitle] = useState(baseTitleVal);
  const [description, setDescription] = useState(baseDescriptionVal);

  const isValid =
    description.length <= 2000 &&
    description.length >= 1 &&
    title.length <= 100 &&
    title.length >= 1 &&
    (title !== baseTitleVal || description !== baseDescriptionVal);

  useEffect(() => {
    setTitle(baseTitleVal);
    setDescription(baseDescriptionVal);
  }, [isOpen, baseTitleVal, baseDescriptionVal]);

  const handleOpenChange = (details) => {
    if (!details.open) onClose();
  };

  return (
    <Dialog.Root size="xl" open={isOpen} onOpenChange={handleOpenChange} placement="center">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="56rem" position="relative" mt="1.75rem">
          <CloseButton position="absolute" top="4" right="4" onClick={onClose} />
          <Dialog.Header fontSize="lg" fontWeight="bold" px="6" pt="6" pb="4">
            {file === undefined ? UI_TEXT.knowledgeBase.quickAdd.add : UI_TEXT.knowledgeBase.quickAdd.edit}
          </Dialog.Header>
          <Dialog.Body display="flex" flexDirection="column" gap="4" px="6" pb="6">
            <Box>
              <LabelInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={UI_TEXT.knowledgeBase.quickAdd.title}
                maxLength={300}
              />
            </Box>
            <Box>
              <CustomTextArea
                label="Content"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder={UI_TEXT.knowledgeBase.quickAdd.content}
                maxLength={2000}
                height="200px"
              />
            </Box>
          </Dialog.Body>

          <Dialog.Footer justifyContent="end" px="6" pb="6">
            <Button
              colorPalette="purple"
              width="fit-content"
              px="30px"
              minH="40px"
              onClick={() => {
                save({
                  title,
                  description,
                });
              }}
              disabled={!isValid}
            >
              {UI_TEXT.knowledgeBase.quickAdd.save}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default BasicQuickAdd;
