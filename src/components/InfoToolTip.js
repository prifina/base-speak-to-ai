import { Box, Tooltip, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

const InfoToolTip = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Tooltip.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      {...props}
    >
      <Tooltip.Trigger asChild>
        <Box
          cursor="pointer"
          display="inline-flex"
          alignItems="center"
          color="gray.500"
        >
          <HiOutlineQuestionMarkCircle size={20} />
        </Box>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            px={3}
            py={2}
            fontSize="sm"
            borderRadius="md"
            bg="bg"
            color="fg"
            borderWidth="1px"
            borderColor="border"
            shadow="sm"
          >
            {children}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
};

export default InfoToolTip;
