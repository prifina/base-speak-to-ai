// src/app/AppProviders.jsx
"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme/system";
import AuthProvider from "./AuthProvider";
import { UserMenuFloating } from "@/components/UserMenuFloating";

export default function AppProviders({ children }) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <UserMenuFloating />
        {/*       <NavBar /> */}
        {children}
      </AuthProvider>
    </ChakraProvider>
  );
}
