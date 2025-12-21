"use client";

import { useEffect, useState, useContext } from "react";
import { Box, Heading, Text, Spinner, VStack } from "@chakra-ui/react";
import { AuthContext } from "@/app/providers/AuthProvider";

export default function HomePage() {
  const { user, loaded: authLoaded } = useContext(AuthContext);

  const loading = !authLoaded;

  return (
    <Box maxW="2xl" mx="auto" mt={10} p={8} borderWidth="1px" borderRadius="lg">
      <Heading mb={4}>Home</Heading>

      {loading && (
        <VStack spacing={4} align="flex-start">
          <Spinner />
          <Text>Loading your data...</Text>
        </VStack>
      )}

      {!loading && (
        <VStack align="flex-start" spacing={3}>
          {/*   
          <Text>
            <strong>User ID (from token):</strong> {apiData?.userId}
          </Text>
          <Text>
            <strong>Username (from token):</strong> {apiData?.username}
          </Text> */}
          {user && (
            <Box mt={4}>
              <Text fontWeight="bold">Client-side AuthContext:</Text>
              <Text fontSize="sm" color="gray.600">
                AuthContext username: {user.username}
              </Text>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}
