"use client";

import * as React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { SideNav } from "./SideNav";
import { UserMenuFloating } from "@/components/UserMenuFloating";

export function AppShell({ navItems, storageKey, children }) {
  return (
    <Flex h="100dvh" overflow="hidden">
      <Toaster />
      <SideNav items={navItems} storageKey={storageKey} />
      <UserMenuFloating />

      <Box flex="1" minW="0" overflow="auto">
        {children}
      </Box>
    </Flex>
  );
}
