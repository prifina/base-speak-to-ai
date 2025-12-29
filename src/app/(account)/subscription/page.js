"use client";

import { useContext } from "react";
import { Box, Text, Flex, VStack } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";
import { Loading } from "@/components/Loading";

export default function SubscriptionPage() {
  const { loaded: authLoaded } = useContext(AuthContext);

  if (!authLoaded) {
    return <Loading />;
  }

  return (
    <Flex flexDir="column" gap="40px" p="28px">
      <Box pl={{ base: "42px", md: "0" }}>
        <Text textStyle="pageTitle">Subscription</Text>
      </Box>
      <VStack align="stretch" gap="6">
        <Text>Subscription details and management will be displayed here.</Text>
      </VStack>
    </Flex>
  );
}
