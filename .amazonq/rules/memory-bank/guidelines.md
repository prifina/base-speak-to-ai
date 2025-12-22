# Development Guidelines

## Code Quality Standards

### File Structure and Naming
- **Client Components**: Use `"use client"` directive at the top of React components that use hooks or browser APIs
- **File Extensions**: Use `.js` for React components and JavaScript files, `.jsx` for JSX-heavy components
- **Component Names**: Use PascalCase for component files and functions (e.g., `LoginPage`, `CustomIcons`)
- **Directory Organization**: Group related components in directories (e.g., `/components/ui`, `/app/(base)`)

### Import Organization
- **React Imports**: Group React hooks together at the top
- **Third-party Libraries**: Import external libraries after React imports
- **Internal Imports**: Import local components and utilities last
- **Destructuring**: Use destructured imports for Chakra UI components in organized blocks

```javascript
// Example import pattern from login/page.js
import {
  useState,
  useContext,
  useEffect,
  useCallback,
  useReducer,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  Carousel,
  AbsoluteCenter,
  Steps,
  // ... other Chakra UI components
} from "@chakra-ui/react";
```

### State Management Patterns
- **useReducer Pattern**: Use `useReducer` with object spread for complex state (frequency: 2/5 files)
- **Zustand Integration**: Use `useShallow` selector for performance optimization
- **State Initialization**: Initialize state objects with all required properties

```javascript
// Standard useReducer pattern
const [state, setState] = useReducer(
  (state, newState) => ({ ...state, ...newState }),
  {
    username: "",
    loginName: "",
    isUsernameError: false,
    // ... other initial values
  }
);
```

## Component Architecture

### Custom Component Creation
- **Icon Components**: Use `GenIcon` from `react-icons` for custom SVG icons
- **Reusable Components**: Create wrapper components for common UI patterns
- **Props Spreading**: Use `{...props}` for flexible component APIs

```javascript
// Custom icon pattern from CustomIcons.js
export const ProfileIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: { viewBox: "0 0 20 20", fill: "none" },
    child: [/* SVG paths */],
  })({ ...props });
};
```

### Authentication Integration
- **Context Usage**: Use `AuthContext` for user state management
- **Protected Routes**: Implement middleware-based route protection
- **Token Handling**: Use cookie-based JWT token storage and validation

### API Integration Patterns
- **Custom Hooks**: Use `useAuthFetch` for authenticated API calls
- **Error Handling**: Implement consistent error handling with try-catch blocks
- **Loading States**: Manage loading states with boolean flags and conditional rendering

## Chakra UI Implementation

### Component Usage
- **Form Components**: Use Chakra UI v3 `Field` components for form validation
- **Layout Components**: Utilize `Box`, `VStack`, `HStack`, `Flex` for layouts
- **Responsive Design**: Use `useMediaQuery` hook for responsive behavior

### Styling Conventions
- **Spacing**: Use consistent spacing values (e.g., `mt="20px"`, `p="28px"`)
- **Typography**: Apply `fontSize` and `fontWeight` props consistently
- **Colors**: Reference theme colors or use specific color values

## Configuration Management

### Next.js Configuration
- **Plugin Composition**: Use `next-compose-plugins` for multiple plugin integration
- **Environment Variables**: Expose environment variables through `env` config
- **Build Optimization**: Configure webpack caching for development performance

```javascript
// Standard Next.js config pattern
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  reactStrictMode: false,
  images: { unoptimized: true },
  env: {
    MY_REGION: process.env.MY_REGION,
  },
};
```

### Middleware Implementation
- **Route Protection**: Define protected paths arrays for easy maintenance
- **Cookie Parsing**: Use `cookie` library for parsing authentication cookies
- **Redirect Logic**: Implement redirect with query parameters for post-login navigation

## Development Best Practices

### Performance Optimization
- **Shallow Selectors**: Use `useShallow` with Zustand for preventing unnecessary re-renders
- **Effect Dependencies**: Properly manage `useEffect` dependencies with `useCallback`
- **Ref Usage**: Use `useRef` for preventing duplicate effect calls

### Error Handling
- **API Responses**: Check response status and handle errors gracefully
- **User Feedback**: Provide clear error messages through UI components
- **Console Logging**: Use descriptive console.log statements for debugging

### Code Organization
- **Single Responsibility**: Keep components focused on single functionality
- **Reusable Logic**: Extract common patterns into custom hooks
- **Configuration Separation**: Keep configuration separate from business logic

### Testing and Debugging
- **Console Logging**: Use descriptive labels for debugging (e.g., "ROUTER REDIRECT", "LOGIN DATA")
- **Development Tools**: Include bundle analyzer and development-specific configurations
- **Error Boundaries**: Implement proper error handling at component boundaries