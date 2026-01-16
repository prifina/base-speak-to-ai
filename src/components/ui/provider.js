"use client"

import * as React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import { system } from "@/theme/system"

export function Provider({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </ThemeProvider>
  )
}
