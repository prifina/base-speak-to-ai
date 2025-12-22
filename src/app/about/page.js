"use client";

import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useAuthFetch } from "@/lib/useAuthFetch";

export default function AboutPage() {
  const authFetch = useAuthFetch();

  return (
    <Box maxW="2xl" mx="auto" mt={10}>
      <Heading mb={4}>About</Heading>
      <Text>
        This is a simple About page used to demonstrate protected routes in a
        Next.js app with Cognito authentication.
      </Text>

      <Button
        onClick={async () => {
          const res = await authFetch("/api/user-health", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            console.log("ERROR RES ", await res.json());
            throw new Error("Failed to get appsync health");
          }
          console.log("RES ", await res.json());
        }}
      >
        APPSYNC HEALTH
      </Button>
    </Box>
  );
}
