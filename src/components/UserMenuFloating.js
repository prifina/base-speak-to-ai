"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  HStack,
  Icon,
  Menu,
  Portal,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import { FloatingMenuWrap } from "@/components/app-shell/Styled"
import { UserMenuAvatar } from "@/components/UserMenuAvatar"
import { LuLayoutDashboard, LuCreditCard, LuSettings } from "react-icons/lu"

const APPS = [
  { key: "admin", label: "Admin", href: "/dashboard", icon: LuLayoutDashboard },
  { key: "billing", label: "Billing", href: "/overview", icon: LuCreditCard },
  { key: "settings", label: "Settings", href: "/settings", icon: LuSettings },
]

export function UserMenuFloating() {
  const router = useRouter()

  return (
    <FloatingMenuWrap>
      <Menu.Root positioning={{ strategy: "fixed", placement: "bottom-end", hideWhenDetached: true, gutter: 16 }}>
        <Menu.Trigger asChild>
          <UserMenuAvatar />
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content p="3" minW="280px" mt="2">
              <Text fontSize="sm" fontWeight="semibold" mb="2">
                Switch area
              </Text>

              <SimpleGrid columns={2} gap="2">
                {APPS.map((app) => (
                  <Menu.Item
                    key={app.key}
                    value={app.href}
                    borderRadius="md"
                    p="2"
                    onClick={() => router.push(app.href)}
                  >
                    <HStack gap="3">
                      <Icon as={app.icon} />
                      <Text fontSize="sm">{app.label}</Text>
                    </HStack>
                  </Menu.Item>
                ))}
              </SimpleGrid>

              <Menu.Separator my="3" />

              <Menu.Item value="/account" onClick={() => router.push("/account")}>
                Account
              </Menu.Item>
              <Menu.Item value="/logout" onClick={() => alert("Demo: implement sign-out")}>
                Logout
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </FloatingMenuWrap>
  )
}
