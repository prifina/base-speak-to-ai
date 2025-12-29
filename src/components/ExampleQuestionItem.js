import {
  Flex,
  Menu,
  Text,
  IconButton
} from "@chakra-ui/react";
import { MdOutlineMoreVert } from "react-icons/md";

const ExampleQuestionItem = ({ edit, noQuestion, deleteFunc, question }) => {
  return (
    <Flex
      padding={"10px 24px 10px 24px"}
      backgroundColor={"#F7F9FB"}
      justifyContent={"space-between"}
      alignItems={"center"}
      key={noQuestion}
    >
      <Text fontSize={"16px"}>
        {noQuestion + 1}. {question}
      </Text>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant="ghost">
            <MdOutlineMoreVert size="25px" />
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item
              value="edit"
              cursor="pointer"
              onClick={() => {
                edit();
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              value="delete"
              cursor="pointer"
              color="#DC2E2D"
              onClick={() => {
                deleteFunc();
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </Flex>
  );
};

export default ExampleQuestionItem;
