import { Flex, Input, Text, Textarea, Field } from "@chakra-ui/react";

const CustomTextArea = ({
  label,
  value,
  maxLength,
  noOfLines,
  isValid = true,
  onChange,
  defaultValue,
  onDefault,
  ...props
}) => {
  const hasError = value?.length >= maxLength || !isValid;
  
  const handleChange = (e) => {
    if (onChange) {
      if (maxLength && e.target.value.length <= maxLength) {
        onChange(e);
      }
    }
  };
  
  return (
    <Field.Root style="bold">
      {label && (
        <Flex justify="space-between" align="center" width="100%">
          <Field.Label>{label}</Field.Label>
          {onDefault && (
            <Text
              cursor="pointer"
              onClick={onDefault}
              fontWeight={600}
              color="#929496"
            >
              Default
            </Text>
          )}
        </Flex>
      )}
      <Flex position="relative" width="100%">
      {noOfLines === 1 ? (
        <Input
          value={value}
          onChange={handleChange}
          paddingRight="75px"
          minHeight="48px"
          borderColor={hasError ? "red" : "#e2e8f0"}
          _focus={{
            borderColor: hasError ? "red" : "var(--black)",
            boxShadow: "none",
          }}
          {...props}
        />
      ) : (
        <Textarea
          noOfLines={noOfLines}
          value={value}
          onChange={handleChange}
          minHeight="20"
          borderColor={hasError ? "red" : "#e2e8f0"}
          _focus={{
            borderColor: hasError ? "red" : "var(--black)",
            boxShadow: "none",
          }}
          {...props}
        />
      )}

      <Text
        position="absolute"
        right="12px"
        bottom="11px"
        fontWeight="400"
        color={value?.length >= maxLength ? "red" : "#9ca1a6"}
      >
        {value?.length}/{maxLength}
      </Text>
    </Flex>
    </Field.Root>
  );
};

export default CustomTextArea;
