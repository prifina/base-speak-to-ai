// src/app/AppProviders.jsx
"use client";

import { useContext } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme/system";
import AuthProvider, { AuthContext } from "./AuthProvider";
import { UserMenuFloating } from "@/components/UserMenuFloating";

function ConditionalUserMenu() {
  const { user } = useContext(AuthContext);
  return user ? <UserMenuFloating /> : null;
}

export default function AppProviders({ children }) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <ConditionalUserMenu />
        {children}
      </AuthProvider>
    </ChakraProvider>
  );
}
