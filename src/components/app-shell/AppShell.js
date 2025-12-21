"use client"

import * as React from "react"
import { Box, Grid } from "@chakra-ui/react"
import { SideNav } from "./SideNav"

export function AppShell({ navItems, storageKey, children }) {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "auto 1fr" }}
      minH="100dvh"
      bg="app.bg"
    >
      <SideNav items={navItems} storageKey={storageKey} />

      <Box minW="0" px={{ base: "4", md: "6" }} py="6">
        {/* Space so fixed controls (user menu + mobile trigger) don't overlap content */}
        <Box pt={{ base: "14", md: "8" }}>{children}</Box>
      </Box>
    </Grid>
  )
}
