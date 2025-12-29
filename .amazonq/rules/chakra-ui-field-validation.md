# Chakra UI v3 Field Validation Rule

## Form Input Validation Pattern

### CRITICAL: Never pass `invalid` prop directly to Input components

In Chakra UI v3, validation state must be handled through the `Field.Root` component wrapper, not directly on `Input`, `Textarea`, or `Select` components.

### ❌ INCORRECT - Will cause React warnings

```javascript
// DO NOT DO THIS
<Input
  value={value}
  onChange={onChange}
  invalid={someCondition}  // ❌ Wrong - causes "non-boolean attribute" warning
/>

// Also incorrect
<Input
  value={value}
  onChange={onChange}
  {...(someCondition && { invalid: true })}  // ❌ Still wrong
/>
```

### ✅ CORRECT - Wrap with Field.Root

```javascript
// DO THIS INSTEAD
<Field.Root invalid={someCondition}>
  <Input
    value={value}
    onChange={onChange}
  />
</Field.Root>
```

### Complete Example with Label and Error Message

```javascript
<Field.Root invalid={value !== "" && !isValid(value)}>
  <Field.Label>Field Label</Field.Label>
  <Input
    value={value}
    onChange={onChange}
    placeholder="Enter value"
  />
  <Field.ErrorText>Invalid input</Field.ErrorText>
</Field.Root>
```

### Applies to All Form Components

This pattern applies to:
- `Input`
- `Textarea`
- `Select` (native)
- `NumberInput`
- `PinInput`

### Required Import

```javascript
import { Field, Input } from "@chakra-ui/react";
```

### Why This Matters

- Passing `invalid` directly to form components causes React to attempt passing it to the native DOM element
- Native HTML doesn't recognize `invalid` as a boolean attribute
- This triggers the warning: "Received `true` for a non-boolean attribute `invalid`"
- `Field.Root` properly handles the validation state and applies appropriate styling/ARIA attributes
