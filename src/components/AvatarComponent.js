import { appColors } from "@/lib/appConfig";
import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { UI_TEXT } from "@/lib/uiStrings";
import { imagePlaceholder } from "@/assets/bse64Images";

const Container = (props) => (
  <Flex
    alignSelf="center"
    position="relative"
    display="flex"
    height="fit-content"
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
    {...props}
  />
);

export const AvatarComponent = ({
  avatar = undefined,
  changeImage = undefined,
  showEditText = true,
  showHelpText = true,
  disabled = false,
  aiIcon = false,
  size = "150px",
}) => {
  return (
    <Container
      cursor={disabled ? "not-allowed" : changeImage ? "pointer" : "default"}
      onClick={() => {
        if (disabled || changeImage === undefined) return;
        changeImage();
      }}
    >
      <Box position="relative">
        <Avatar.Root boxSize={size} size="2xl">
          <Avatar.Image objectFit="cover" src={avatar || imagePlaceholder} />
        </Avatar.Root>
        {aiIcon && (
          <Box
            position="absolute"
            bottom="-5px"
            right="-5px"
            boxSize="60px"
            borderColor="white"
            bg="black"
            borderWidth="3px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="35px" fontWeight={700} color="white">
              AI
            </Text>
          </Box>
        )}
      </Box>

      {showEditText && (
        <Text color={appColors.link} mt="2" fontSize="sm">
          {UI_TEXT.profile.avatar.editText}
        </Text>
      )}
      {showHelpText && (
        <Flex w="58%" textAlign="center" mt="5px" mb="10px">
          <Text color="darkgray">{UI_TEXT.profile.avatar.helpText}</Text>
        </Flex>
      )}
    </Container>
  );
};
