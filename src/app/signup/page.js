import { AbsoluteCenter, Box, Heading } from "@chakra-ui/react";

export default function SignupPage() {
  return (
    <AbsoluteCenter>
      <Box
        w={"450px"}
        mx="auto"
        mt={10}
        p={8}
        borderWidth="1px"
        borderRadius="lg"
      >
        <Heading mb={6}>Signup</Heading>
      </Box>
    </AbsoluteCenter>
  );
}
