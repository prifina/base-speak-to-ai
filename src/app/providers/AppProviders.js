// src/app/AppProviders.jsx
"use client";

import { useContext, useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme/system";
import AuthProvider, { AuthContext } from "./AuthProvider";
import { UserMenuFloating } from "@/components/UserMenuFloating";
import {
  initBrowserTelemetry,
  TelemetryErrorBoundary,
} from "@prifina-dev/next-telemetry/client";

function ConditionalUserMenu() {
  const { user } = useContext(AuthContext);
  return user ? <UserMenuFloating /> : null;
}

export default function AppProviders({ children }) {
  useEffect(() => {
    initBrowserTelemetry();
  }, []);

  return (
    <TelemetryErrorBoundary>
      <ChakraProvider value={system}>
        <AuthProvider>
          <ConditionalUserMenu />
          {children}
        </AuthProvider>
      </ChakraProvider>
    </TelemetryErrorBoundary>
  );
}
