import { useMemo } from "react";
import {
  Text,
  Field,
  Select,
  createListCollection,
  Portal,
} from "@chakra-ui/react";

const TEXT_COLOR = "#929496";

export const SelectField = ({
  title,
  description,
  options,
  value,
  onChange,
  isClearable,
}) => {
  const collection = useMemo(
    () => createListCollection({ items: options }),
    [options]
  );

  return (
    <Field.Root style="bold">
      <Field.Label>{title}</Field.Label>
      <Text color={TEXT_COLOR} mb="8px">
        {description}
      </Text>
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={(details) => {
          onChange(details.value[0] ? { value: details.value[0] } : null);
        }}
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
              {options.map((option) => (
                <Select.Item key={option.value} item={option}>
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
