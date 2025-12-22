import { Input, Field } from "@chakra-ui/react";

export const LabelInput = ({ label, value, name, onChange, placeholder }) => {
  return (
    <Field.Root style="bold">
      <Field.Label>{label}</Field.Label>
      <Input
        value={value || ""}
        name={name}
        onChange={onChange}
        variant="flushed"
        placeholder={placeholder}
      />
    </Field.Root>
  );
};
