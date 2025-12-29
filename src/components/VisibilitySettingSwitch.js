import { Flex, Skeleton, Spacer, Switch, Text } from "@chakra-ui/react";

const VisibilitySettingSwitch = ({
  title,
  description,
  value,
  onChange,
  children,
  isLoaded = true,
}) => {
  return (
    <Flex flexDirection="column" gap="10px">
      <Flex align="center">
        <Text textStyle="fieldLabel">{title}</Text>
        <Spacer />
        {isLoaded ? (
          <Switch.Root colorPalette="blue" checked={value} onCheckedChange={(e) => onChange({ target: { checked: e.checked } })}>
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
        ) : (
          <Skeleton height="24px" width="44px" />
        )}
      </Flex>

      <Text fontSize="16px">{description}</Text>
      {children}
    </Flex>
  );
};

export default VisibilitySettingSwitch;
