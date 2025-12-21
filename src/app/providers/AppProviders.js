// src/app/AppProviders.jsx
"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import AuthProvider from "./AuthProvider";
//import NavBar from "./components/NavBar";

export default function AppProviders({ children }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <AuthProvider>
        {/*       <NavBar /> */}
        {children}
      </AuthProvider>
    </ChakraProvider>
  );
}
