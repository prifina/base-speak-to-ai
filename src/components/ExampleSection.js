import { Suspense, useState, useRef, useReducer, useEffect } from "react";
import {
  Button,
  Flex,
  Input,
  Text,
  Box,
  VStack,
  HStack,
  Field,
} from "@chakra-ui/react";
import { HiPlus } from "react-icons/hi";

import CustomTextArea from "@/components/CustomTextArea";
import ExampleQuestionItem from "./ExampleQuestionItem";
import AddExampleQuestion from "@/components/Modals/AddExampleQuestion";
import { SelectField } from "@/components/SelectField";
import { isValidUrl } from "@/utils";
import {
  noOfQuestionsOptions,
  typeOfQuestionsOptions,
} from "@/utils/selectOptions";
import { UI_TEXT } from "@/lib/uiStrings";
import { useAuthFetch } from "@/lib/useAuthFetch";
import InfoToolTip from "./InfoToolTip";

const disclaimerTextMaxLength = 150;
const exampleQuestionsArrMaxLength = 6;

const ExampleSection = ({ profileTempState, updateProfileTempState, opts }) => {
  const {
    exampleQuestions,
    disclaimerText,
    disclaimerLink,
    typeOfExampleQuestions,
    noOfExampleQuestions,
  } = profileTempState;

  const authFetch = useAuthFetch();
  const { language } = opts;

  const [selectedIndex, setSelectedIndex] = useState(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      noOfQuestionsOptions,
      typeOfQuestionsOptions,
    }
  );
  const effectCalled = useRef(false);

  useEffect(() => {
    if (!effectCalled.current) {
      effectCalled.current = true;
      (async () => {
        try {
          const res = await authFetch(`/api/get-config?language=${language}`, {
            method: "GET",
          });

          if (!res.ok) {
            const errorData = await res.json();
            console.log("ERROR RES ", errorData);
            throw new Error("Failed to get appsync response");
          }
          const data = await res.json();
          setState({
            noOfQuestionsOptions:
              data.config.noOfQuestionsOptions || noOfQuestionsOptions,
            typeOfQuestionsOptions:
              data.config.typeOfQuestionsOptions || typeOfQuestionsOptions,
          });
        } catch (err) {
          console.error("Failed to load config", err);
        }
      })();
    }
  }, [authFetch, language]);

  const openModal = (index = undefined) => {
    setIsModalOpen(true);
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndex(undefined);
  };

  const saveNewExampleQuestion = (text) => {
    updateProfileTempState({
      exampleQuestions: exampleQuestions ? [...exampleQuestions, text] : [text],
    });
  };

  const updateExampleQuestion = (text) => {
    updateProfileTempState({
      exampleQuestions: exampleQuestions.map((item, index) => {
        if (index === selectedIndex) {
          return text;
        }
        return item;
      }),
    });
  };

  const saveExampleQuestion = (text) => {
    if (selectedIndex === undefined) {
      saveNewExampleQuestion(text);
    } else {
      updateExampleQuestion(text);
    }
  };

  const updateState = (attr, value) => {
    updateProfileTempState({ [attr]: value === null ? "" : value.value });
  };

  return (
    <Flex flexDirection="column" gap="40px">
      {isModalOpen && (
        <Suspense>
          <AddExampleQuestion
            isOpen={isModalOpen}
            onClose={closeModal}
            initialQuestionData={
              exampleQuestions ? exampleQuestions[selectedIndex] : ""
            }
            save={(text) => {
              saveExampleQuestion(text);
              closeModal();
            }}
          />
        </Suspense>
      )}

      <VStack align="stretch" spacing="20px">
        <Box>
          <Text textStyle="fieldLabel" mb="8px">
            {UI_TEXT.personalization.disclaimerAndExamples.disclaimer.text}
          </Text>
          <CustomTextArea
            maxLength={disclaimerTextMaxLength}
            resize="none"
            name="description"
            value={disclaimerText ?? ""}
            onChange={(e) => {
              updateProfileTempState({
                disclaimerText: e.target.value,
              });
            }}
            placeholder={
              UI_TEXT.personalization.disclaimerAndExamples.disclaimer
                .textPlaceholder
            }
          />
        </Box>

        <Box>
          <Text textStyle="fieldLabel" mb="8px">
            {UI_TEXT.personalization.disclaimerAndExamples.disclaimer.link}
          </Text>
          <Field.Root
            invalid={
              disclaimerLink !== "" &&
              disclaimerLink !== undefined &&
              !isValidUrl(disclaimerLink)
            }
          >
            <Input
              minHeight="48px"
              name="description"
              value={disclaimerLink ?? ""}
              onChange={(e) => {
                updateProfileTempState({
                  disclaimerLink: e.target.value,
                });
              }}
              placeholder={
                UI_TEXT.personalization.disclaimerAndExamples.disclaimer
                  .linkPlaceholder
              }
            />
          </Field.Root>
        </Box>
      </VStack>

      <Box>
        <Text textStyle="fieldLabel" mb="20px">
          {UI_TEXT.personalization.disclaimerAndExamples.examples.title}
        </Text>

        <VStack align="stretch" spacing="20px">
          <SelectField
            title={UI_TEXT.personalization.disclaimerAndExamples.examples.count}
            options={state.noOfQuestionsOptions}
            value={noOfExampleQuestions}
            onChange={(value) => updateState("noOfExampleQuestions", value)}
          />

          <HStack align="flex-end" spacing="8px">
            <Box flex="1">
              <SelectField
                title={UI_TEXT.personalization.disclaimerAndExamples.examples.types}
                options={state.typeOfQuestionsOptions}
                value={typeOfExampleQuestions}
                onChange={(value) => updateState("typeOfExampleQuestions", value)}
              />
            </Box>
            <Box pb="2px">
              <InfoToolTip>
                <VStack align="stretch" gap="3">
                  <Box>
                    <Text textStyle="tooltipTerm">
                      {UI_TEXT.personalization.disclaimerAndExamples.examples.tooltip.automated.title}
                    </Text>
                    <Text textStyle="tooltipDescription">
                      {UI_TEXT.personalization.disclaimerAndExamples.examples.tooltip.automated.description}
                    </Text>
                  </Box>
                  <Box>
                    <Text textStyle="tooltipTerm">
                      {UI_TEXT.personalization.disclaimerAndExamples.examples.tooltip.manual.title}
                    </Text>
                    <Text textStyle="tooltipDescription">
                      {UI_TEXT.personalization.disclaimerAndExamples.examples.tooltip.manual.description}
                    </Text>
                  </Box>
                  <Box>
                    <Text textStyle="tooltipTerm">
                      {UI_TEXT.personalization.disclaimerAndExamples.examples.tooltip.mix.title}
                    </Text>
                    <Text textStyle="tooltipDescription">
                      {UI_TEXT.personalization.disclaimerAndExamples.examples.tooltip.mix.description}
                    </Text>
                  </Box>
                </VStack>
              </InfoToolTip>
            </Box>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <HStack justify="space-between" mb="20px">
          <Text textStyle="fieldLabel">
            {UI_TEXT.personalization.disclaimerAndExamples.examples.listHeader}
          </Text>
          <Button
            variant="outline"
            size="md"
            disabled={exampleQuestions?.length >= exampleQuestionsArrMaxLength}
            colorScheme="blue"
            onClick={() => openModal()}
          >
            <HiPlus />
            {UI_TEXT.personalization.disclaimerAndExamples.examples.addButton}
          </Button>
        </HStack>

        {exampleQuestions?.length > 0 && (
          <VStack align="stretch" spacing="12px">
            {exampleQuestions.map((txt, index) => (
              <ExampleQuestionItem
                key={`question-${index}`}
                deleteFunc={() => {
                  updateProfileTempState({
                    exampleQuestions: exampleQuestions.filter(
                      (_, i) => i !== index
                    ),
                  });
                }}
                edit={() => openModal(index)}
                noQuestion={index}
                question={txt}
              />
            ))}
          </VStack>
        )}
      </Box>
    </Flex>
  );
};

export default ExampleSection;
