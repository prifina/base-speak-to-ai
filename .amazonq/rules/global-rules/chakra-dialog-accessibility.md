# Chakra UI Dialog Accessibility Rule

## CRITICAL: Always Add Focus Management Props to Dialog Components

When using Chakra UI v3 Dialog components, always include proper focus management props to prevent ARIA warnings and ensure accessibility compliance.

### ❌ INCORRECT - Missing focus management

```javascript
// DO NOT DO THIS - causes ARIA warnings
<Dialog.Root
  open={isOpen}
  onOpenChange={onOpenChange}
>
  <Dialog.Backdrop />
  <Dialog.Positioner>
    <Dialog.Content>
      {/* Modal content */}
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

### ✅ CORRECT - Include focus management props

```javascript
// DO THIS INSTEAD
<Dialog.Root
  open={isOpen}
  onOpenChange={onOpenChange}
  trapFocus
  preventScroll
>
  <Dialog.Backdrop />
  <Dialog.Positioner>
    <Dialog.Content>
      {/* Modal content */}
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

### Required Props

- **`trapFocus`** - Ensures focus stays within the modal and prevents focus conflicts with background elements
- **`preventScroll`** - Prevents background scrolling while modal is open

### Why This Matters

- Prevents ARIA warning: "Blocked aria-hidden on an element because its descendant retained focus"
- Ensures proper accessibility for screen readers and keyboard navigation
- Maintains focus within the modal dialog as expected by users
- Follows WAI-ARIA specification guidelines

### Applies To All Dialog Types

This pattern applies to:
- `Dialog.Root` (modals)
- `Drawer.Root` (side panels)
- `Popover.Root` (when used as modal)

### Required Import

```javascript
import { Dialog } from "@chakra-ui/react";
```