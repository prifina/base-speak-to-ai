import { useState } from "react";
import { Flex, Spacer, Stack, Text, Box, VStack } from "@chakra-ui/react";
import { RadioGroup } from "@chakra-ui/react";

import CustomTextArea from "@/components/CustomTextArea";
import VisibilitySettingSwitch from "./VisibilitySettingSwitch";
import { customFooterTemplateOptions } from "@/utils/selectOptions";
import { UI_TEXT } from "@/lib/uiStrings";

const customFooterTextMaxLength = 50;
const customFooterLinkMaxLength = 100;

const FooterSection = ({ profileTempState = {}, updateProfileTempState }) => {
  const {
    showContactMe,
    hideFooter,
    customFooterText,
    customFooterLink,
  } = profileTempState;

  const [customFooter, setCustomFooter] = useState(hideFooter ? "0" : "1");

  return (
    <Flex flexDirection="column" gap="40px">
      <VisibilitySettingSwitch
        title={UI_TEXT.personalization.footer.contactMe.title}
        description={UI_TEXT.personalization.footer.contactMe.description}
        value={showContactMe ?? false}
        onChange={() => {
          updateProfileTempState({
            showContactMe: !showContactMe,
          });
        }}
      />
      
      <Box>
        <Text textStyle="fieldLabel" mb="20px">
          {UI_TEXT.personalization.footer.customFooter.title}
        </Text>

        <RadioGroup.Root
          colorPalette="blue"
          ml="25px"
          onValueChange={(details) => {
            const newValue = details.value;
            setCustomFooter(newValue);
            updateProfileTempState({
              hideFooter: parseInt(newValue) === 0,
            });
          }}
          value={customFooter}
        >
          <Stack gap="24px">
            {customFooterTemplateOptions.map((option, index) => (
              <RadioGroup.Item
                key={`footer-option-${index}`}
                value={`${option.value}`}
                display="flex"
                alignItems="center"
                cursor="pointer"
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl mr="2" />
                <RadioGroup.ItemText fontSize="md">
                  {option.label}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </Stack>
        </RadioGroup.Root>
        
        {customFooter === "1" && (
          <VStack align="stretch" spacing="37px" mt="40px" ml="50px">
            <Box>
              <Flex justify="space-between" mb="6px">
                <Text fontWeight={600} color="#242426">
                  {UI_TEXT.personalization.footer.customFooter.textLabel}
                </Text>
                <Text
                  cursor="pointer"
                  onClick={() => {
                    updateProfileTempState({
                      customFooterText: UI_TEXT.personalization.footer.customFooter.defaultTextValue,
                    });
                  }}
                  fontWeight={600}
                  color="#929496"
                >
                  {UI_TEXT.personalization.footer.customFooter.defaultText}
                </Text>
              </Flex>
              <CustomTextArea
                noOfLines={1}
                maxLength={customFooterTextMaxLength}
                value={customFooterText || UI_TEXT.personalization.footer.customFooter.defaultTextValue}
                onChange={(e) => {
                  updateProfileTempState({
                    customFooterText: e.target.value,
                  });
                }}
              />
            </Box>
            
            <Box>
              <Flex justify="space-between" mb="6px">
                <Text fontWeight={600} color="#242426">
                  {UI_TEXT.personalization.footer.customFooter.linkLabel}{" "}
                  <Text as="span" fontWeight={400}>
                    {UI_TEXT.personalization.footer.customFooter.optionalLink}
                  </Text>
                </Text>
                <Text
                  cursor="pointer"
                  onClick={() => {
                    updateProfileTempState({
                      customFooterLink: UI_TEXT.personalization.footer.customFooter.defaultLinkValue,
                    });
                  }}
                  fontWeight={600}
                  color="#929496"
                >
                  {UI_TEXT.personalization.footer.customFooter.defaultText}
                </Text>
              </Flex>
              <CustomTextArea
                noOfLines={1}
                maxLength={customFooterLinkMaxLength}
                value={customFooterLink || UI_TEXT.personalization.footer.customFooter.defaultLinkValue}
                onChange={(e) => {
                  updateProfileTempState({
                    customFooterLink: e.target.value,
                  });
                }}
              />
            </Box>
          </VStack>
        )}
      </Box>
    </Flex>
  );
};

export default FooterSection;
