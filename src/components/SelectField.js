import { useMemo } from "react";
import {
  Text,
  Field,
  Select,
  createListCollection,
  Portal,
} from "@chakra-ui/react";

export const SelectField = ({
  title,
  description,
  options,
  value,
  onChange,
  isClearable,
  disabled,
}) => {
  const collection = useMemo(
    () => createListCollection({ items: options }),
    [options]
  );

  return (
    <Field.Root style="bold">
      <Field.Label>{title}</Field.Label>
      <Text textStyle="fieldDescription">
        {description}
      </Text>
      <Select.Root
        collection={collection}
        value={value !== null && value !== undefined ? [value] : []}
        onValueChange={(details) => {
          onChange(details.value[0] !== undefined ? { value: details.value[0] } : null);
        }}
        disabled={disabled}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select..." />
          </Select.Trigger>
          <Select.IndicatorGroup>
            {isClearable && <Select.ClearTrigger />}
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {options.map((option, index) => (
                <Select.Item key={option.value || index} item={option}>
                  {option.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  );
};
