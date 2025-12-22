# Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 14.2.35** - React framework with App Router
- **React 18.2.0** - UI library with hooks and modern features
- **React DOM 18.2.0** - React rendering for web

### UI Framework
- **Chakra UI 3.2.2** - Modern React component library
- **Emotion React 11.13.5** - CSS-in-JS styling solution
- **React Icons 5.5.0** - Icon library integration

### Authentication & AWS
- **AWS Amplify 6.15.9** - AWS integration and authentication
- **@aws-amplify/adapter-nextjs 1.6.12** - Next.js specific Amplify adapter
- **@aws-sdk/client-dynamodb 3.954.0** - DynamoDB client
- **@aws-sdk/lib-dynamodb 3.954.0** - DynamoDB document client
- **jose 6.1.3** - JWT token handling

### State Management & Utilities
- **Zustand 5.0.9** - Lightweight state management
- **cookie 1.1.1** - Cookie parsing and handling
- **uuid 9.0.1** - UUID generation
- **next-plausible 3.12.5** - Analytics integration

## Development Tools

### Code Quality
- **ESLint 8.39.0** - JavaScript/TypeScript linting
- **eslint-config-next 14.0.0** - Next.js specific ESLint rules

### Build Tools
- **@next/bundle-analyzer 15.0.3** - Bundle size analysis
- **next-compose-plugins 2.2.1** - Next.js plugin composition

## Development Commands

### Local Development
```bash
npm run dev          # Start development server on port 3333
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Configuration Files
- **jsconfig.json** - JavaScript project configuration with path mapping
- **next.config.js** - Next.js build and runtime configuration
- **.eslintrc.json** - ESLint rules and configuration
- **.env.local** - Environment variables (not in repository)

## Runtime Environment

### Node.js Requirements
- Compatible with Node.js 18+ (based on React 18 and Next.js 14)
- Development server runs on port 3333
- Production build supports static export option

### Browser Support
- Modern browsers supporting ES2020+
- React 18 concurrent features support
- CSS Grid and Flexbox support required for Chakra UI

## AWS Integration

### Services Used
- **AWS Cognito** - User authentication and management
- **AWS DynamoDB** - NoSQL database for application data
- **AWS Amplify** - Full-stack development platform

### Authentication Flow
- JWT token-based authentication
- Server-side session validation
- Middleware-protected routes
- Cookie-based session management