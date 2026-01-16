import {
  AccordionItem,
  Box,
} from "@chakra-ui/react";
import { Accordion } from "@chakra-ui/react";
import ProfileSection from "./ProfileSection";
import { FaChevronRight, FaChevronUp } from "react-icons/fa";

const PersonalizationAccordionItem = ({ children, title }) => {
  return (
    <AccordionItem value={title} border="none" mb="32px">
      <Accordion.ItemTrigger
        borderRadius="4px"
        height="56px"
        bg="#f6f6f6"
      >
        <Box
          lineHeight="28px"
          fontSize="16px"
          as="span"
          fontWeight="semibold"
          flex="1"
          textAlign="left"
        >
          {title}
        </Box>
        <Accordion.ItemIndicator>
          <FaChevronRight />
        </Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent pb={4}>
        <ProfileSection paddingTop="40px">{children}</ProfileSection>
      </Accordion.ItemContent>
    </AccordionItem>
  );
};

export default PersonalizationAccordionItem;
