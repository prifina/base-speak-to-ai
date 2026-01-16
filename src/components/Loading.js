"use client";
import { Text, Spinner, VStack, Flex } from "@chakra-ui/react";

export const Loading = () => {
  return (
    <Flex
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      alignItems="center"
      justifyContent="center"
    >
      <VStack colorPalette="teal">
        <Spinner
          borderWidth="6px"
          animationDuration="1.2s"
          color={"teal.500"}
          size="xl"
          width="100px"
          height="100px"
          css={{ "--spinner-track-color": "colors.gray.200" }}
        />
        <Text color="colorPalette.600">Loading...</Text>
      </VStack>
    </Flex>
  );
};
