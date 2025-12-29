import { Button } from "@chakra-ui/react";

const SaveButton = ({ title = "Save Changes", ...props }) => {
  return (
    <Button
      colorPalette="purple"
      width="fit-content"
      px="30px"
      fontWeight={600}
      minH="40px"
      {...props}
    >
      {title}
    </Button>
  );
};

export default SaveButton;
