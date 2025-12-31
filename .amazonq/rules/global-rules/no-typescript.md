# No TypeScript Rule

## CRITICAL: JavaScript Only Project

This project uses **JavaScript exclusively** - TypeScript is not allowed.

### ❌ PROHIBITED
- `.ts` file extensions
- `.tsx` file extensions  
- TypeScript syntax (interfaces, types, etc.)
- TypeScript-specific imports or configurations

### ✅ REQUIRED
- Use `.js` for all JavaScript files
- Use `.jsx` for JSX-heavy React components
- Standard JavaScript syntax only
- JSDoc comments for type documentation if needed

### File Extensions
```
✅ component.js
✅ component.jsx
❌ component.ts
❌ component.tsx
```

### Why JavaScript Only
- Project is configured for JavaScript development
- Maintains consistency with existing codebase
- Avoids TypeScript compilation overhead
- Keeps development setup simple