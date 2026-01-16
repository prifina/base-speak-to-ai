import { Box, Tooltip, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { IoIosInformationCircle } from "react-icons/io";

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
        >
          <IoIosInformationCircle size={20} />
        </Box>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            px={3}
            py={2}
            fontSize="sm"
            borderRadius="md"
            bg="gray.700"
            color="white"
          >
            {children}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
};

export default InfoToolTip;
