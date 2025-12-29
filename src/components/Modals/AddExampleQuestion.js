import { Button, Flex, Text } from "@chakra-ui/react";
import { Dialog } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CustomTextArea from "../CustomTextArea";
import { UI_TEXT } from "@/lib/uiStrings";

const exampleQuestionTextMaxLength = 150;

const AddExampleQuestion = ({
  isOpen,
  onClose,
  initialQuestionData = "",
  save,
}) => {
  const [exampleQuestion, setExampleQuestion] = useState(initialQuestionData);
  const isExampleQuestionValid =
    exampleQuestion?.length <= exampleQuestionTextMaxLength;

  useEffect(() => {
    setExampleQuestion(initialQuestionData);
  }, [initialQuestionData, isOpen]);

  const handleOpenChange = (details) => {
    if (!details.open) onClose();
  };

  const handleSaveQuestion = () => {
    save(exampleQuestion);
  };

  const handleQuestionChange = (e) => {
    setExampleQuestion(e.target.value);
  };

  return (
    <Dialog.Root size="xl" open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Body>
            <Flex flexDirection="column" gap="20px" margin="10px">
              <Text fontWeight="700" fontSize="18px" lineHeight="24.5px">
                {UI_TEXT.personalization.disclaimerAndExamples.examples.modal.title}
              </Text>

              <CustomTextArea
                maxLength={exampleQuestionTextMaxLength}
                resize="none"
                name="description"
                value={exampleQuestion}
                onChange={handleQuestionChange}
                placeholder={UI_TEXT.personalization.disclaimerAndExamples.examples.modal.placeholder}
                isValid={isExampleQuestionValid}
              />
              <Flex justifyContent="end" gap="20px">
                <Button variant="outline" onClick={onClose}>
                  {UI_TEXT.personalization.disclaimerAndExamples.examples.modal.cancel}
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveQuestion}
                  disabled={
                    !isExampleQuestionValid ||
                    exampleQuestion === initialQuestionData
                  }
                >
                  {UI_TEXT.personalization.disclaimerAndExamples.examples.modal.save}
                </Button>
              </Flex>
            </Flex>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default AddExampleQuestion;
