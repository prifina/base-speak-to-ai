# Project Structure

## Directory Organization

### Core Application (`/src`)
- **`/app`** - Next.js App Router structure
  - **`/(base)`** - Base layout group with home page
  - **`/(insights)`** - Insights section (placeholder)
  - **`/(uploads)`** - Uploads section (placeholder)
  - **`/api`** - API route handlers for authentication and data
  - **`/login`** - Authentication pages
  - **`/providers`** - React context providers
- **`/components`** - Reusable UI components
  - **`/app-shell`** - Application shell components (AppShell, SideNav)
  - **`/ui`** - Base UI components and providers
- **`/lib`** - Utility libraries and configurations
- **`/theme`** - Chakra UI theme configuration
- **`/utils`** - General utility functions

### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`next.config.js`** - Next.js configuration
- **`jsconfig.json`** - JavaScript/TypeScript configuration
- **`middleware.js`** - Next.js middleware for route protection

### Example Projects
- **`/chakra-nextjs-sidemenu-example`** - Side menu implementation example
- **`/next-cognito-nav-src-example`** - Cognito navigation example

## Core Components

### Authentication Flow
- **AuthProvider** - React context for authentication state
- **Middleware** - Route protection and authentication checks
- **API Routes** - Authentication endpoints (login, logout, check-user)

### UI Architecture
- **AppShell** - Main application layout wrapper
- **SideNav** - Navigation sidebar component
- **Provider** - Chakra UI theme and configuration provider
- **Custom Components** - Specialized UI components (CustomIcons, LabelInput, etc.)

### State Management
- **Zustand Store** - Client-side state management
- **Session Store** - Authentication session handling
- **Auth Helpers** - Authentication utility functions

## Architectural Patterns

### Route Organization
- **Route Groups** - Organized by feature using Next.js route groups
- **Protected Routes** - Middleware-based authentication protection
- **API Structure** - RESTful endpoints under `/api` directory

### Component Structure
- **Atomic Design** - Components organized by complexity and reusability
- **Provider Pattern** - Context providers for global state
- **Custom Hooks** - Reusable logic extraction (useAuthFetch, useMediaQuery)

### Configuration Management
- **Environment Variables** - Secure configuration through `.env.local`
- **Theme System** - Centralized styling through Chakra UI theme
- **Build Configuration** - Next.js and bundler optimizations