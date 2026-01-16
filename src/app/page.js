import { Box, Heading, Text, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";

export default function HomePage() {
  return (
    <Box maxW="2xl" mx="auto" mt={10}>
      <Heading mb={4}>Welcome</Heading>
      <Text mb={4}>
        This is a public home page. Try going to the{" "}
        <ChakraLink as={Link} href="/home" color="blue.500">
          Home
        </ChakraLink>{" "}
        to see protected navigation in action.
      </Text>
    </Box>
  );
}
