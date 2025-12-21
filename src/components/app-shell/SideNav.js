"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Separator,
  Stack,
  Drawer,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { NavItem, SideNavHeader, SideNavRoot, MobileMenuButtonWrap } from "./Styled"
import { LuChevronLeft, LuChevronRight, LuMenu } from "react-icons/lu"

function useLocalStorageBool(key, initialValue) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return
      setValue(raw === "true")
    } catch {}
  }, [key])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, String(value))
    } catch {}
  }, [key, value])

  return [value, setValue]
}

function SideNavContent({ items, collapsed, onToggleCollapsed, onNavigate }) {
  const router = useRouter()
  const pathname = usePathname()

  const go = (href) => {
    if (onNavigate) onNavigate()
    router.push(href)
  }

  return (
    <Flex direction="column" h="100dvh">
      <SideNavHeader collapsed={collapsed}>
        <Text fontWeight="semibold" fontSize="sm" truncate>
          {collapsed ? "⋯" : "Example App"}
        </Text>

        {!collapsed && (
          <IconButton
            aria-label="Collapse sidebar"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
          >
            <Icon as={LuChevronLeft} />
          </IconButton>
        )}

        {collapsed && (
          <IconButton
            aria-label="Expand sidebar"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapsed}
          >
            <Icon as={LuChevronRight} />
          </IconButton>
        )}
      </SideNavHeader>

      <Separator />

      <Stack gap="1" p="2" flex="1" overflowY="auto">
        {items.map((it) => {
          const active =
            pathname === it.href || (pathname || "").startsWith(it.href + "/")

          const itemNode = (
            <NavItem
              role="button"
              tabIndex={0}
              aria-current={active ? "page" : undefined}
              active={active}
              collapsed={collapsed}
              onClick={() => go(it.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") go(it.href)
              }}
            >
              <HStack gap="3" w="full" justify={collapsed ? "center" : "flex-start"}>
                <Icon as={it.icon} />
                {!collapsed && <Text truncate>{it.label}</Text>}
              </HStack>
            </NavItem>
          )

          // Tooltip only when collapsed (desktop)
          return (
            <Tooltip.Root
              key={it.key}
              openDelay={200}
              disabled={!collapsed}
              positioning={{ placement: "right" }}
            >
              <Tooltip.Trigger asChild>{itemNode}</Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content>{it.label}</Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
          )
        })}
      </Stack>

      <Box px="3" py="3">
        <Text fontSize="xs" color="app.muted" textAlign={collapsed ? "center" : "left"}>
          {collapsed ? "v1" : "Demo UI · v1.0"}
        </Text>
      </Box>
    </Flex>
  )
}

export function SideNav({ items, storageKey = "sidebar-collapsed" }) {
  const [collapsed, setCollapsed] = useLocalStorageBool(storageKey, false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const sidebarW = collapsed ? "sidebarCollapsed" : "sidebarExpanded"

  return (
    <>
      {/* Desktop sidebar */}
      <Box display={{ base: "none", md: "block" }} w={sidebarW}>
        <SideNavRoot w="full">
          <SideNavContent
            items={items}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((v) => !v)}
          />
        </SideNavRoot>
      </Box>

      {/* Mobile: drawer + fixed trigger */}
      <Box display={{ base: "block", md: "none" }}>
        <Drawer.Root
          open={mobileOpen}
          onOpenChange={(e) => setMobileOpen(!!e.open)}
          placement="start"
          size="xs"
        >
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Menu</Drawer.Title>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body p="0">
                <SideNavContent
                  items={items}
                  collapsed={false}
                  onToggleCollapsed={() => {}}
                  onNavigate={() => setMobileOpen(false)}
                />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>

        <MobileMenuButtonWrap>
          <IconButton aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Icon as={LuMenu} />
          </IconButton>
        </MobileMenuButtonWrap>
      </Box>
    </>
  )
}
