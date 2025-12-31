"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Separator,
  Stack,
  Drawer,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  NavItem,
  SideNavHeader,
  SideNavRoot,
  MobileMenuButtonWrap,
} from "./Styled";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMenu,
  LuCircleHelp,
} from "react-icons/lu";
import { UI_TEXT } from "@/lib/uiStrings";
import { EVALS } from "@/lib/appConfig";

function useLocalStorageBool(key, initialValue) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return;
      setValue(raw === "true");
    } catch {}
  }, [key]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

function SideNavContent({ items, collapsed, onToggleCollapsed, onNavigate }) {
  const router = useRouter();
  const pathname = usePathname();

  const go = (href) => {
    if (onNavigate) onNavigate();
    router.push(href);
    router.refresh();
  };

  return (
    <Flex direction="column" h="100dvh">
      <SideNavHeader collapsed={collapsed}>
        {collapsed ? (
          <Flex
            w="full"
            justify="center"
            cursor="pointer"
            onClick={() => go("/home")}
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            borderRadius="md"
            p={2}
          >
            <Image src="/assets/base_icon.svg" alt="Logo" boxSize="6" />
          </Flex>
        ) : (
          <>
            <HStack gap="2" cursor="pointer" onClick={() => go("/home")} _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} borderRadius="md" p={2}>
              <Image src="/assets/base_icon.svg" alt="Logo" boxSize="8" />
              <Text fontSize="20px" fontWeight={600} color="white">
                {UI_TEXT.app.title}
              </Text>
            </HStack>
            <IconButton
              aria-label="Collapse sidebar"
              variant="ghost"
              size="sm"
              onClick={onToggleCollapsed}
              color="white"
            >
              <Icon as={LuChevronLeft} />
            </IconButton>
          </>
        )}
      </SideNavHeader>

      <Separator />

      <Box h="30px" />

      <Stack gap="5" p="2" overflowY="auto">
        {items.map((it) => {
          const active =
            pathname === it.href || (pathname || "").startsWith(it.href + "/");

          const itemNode = (
            <NavItem
              role="button"
              tabIndex={0}
              aria-current={active ? "page" : undefined}
              active={active}
              collapsed={collapsed}
              onClick={() => go(it.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") go(it.href);
              }}
            >
              <HStack
                gap="3"
                w="full"
                justify={collapsed ? "center" : "flex-start"}
              >
                <Icon as={it.icon} boxSize="30px" />
                {!collapsed && <Text truncate>{it.label}</Text>}
              </HStack>
            </NavItem>
          );

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
          );
        })}
      </Stack>

      <Box px="2" py="3">
        <Separator />
      </Box>

      <Box px="2" pb="3">
        <NavItem
          role="button"
          tabIndex={0}
          collapsed={collapsed}
          onClick={() => window.open(EVALS.generalGuideDoc, "_blank")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.open(EVALS.generalGuideDoc, "_blank");
          }}
        >
          <HStack
            gap="3"
            w="full"
            justify={collapsed ? "center" : "flex-start"}
          >
            <Icon as={LuCircleHelp} boxSize="30px" />
            {!collapsed && <Text truncate>{UI_TEXT.app.help}</Text>}
          </HStack>
        </NavItem>
      </Box>

      <Box flex="1" />
    </Flex>
  );
}

export function SideNav({ items, storageKey = "sidebar-collapsed" }) {
  const [collapsed, setCollapsed] = useLocalStorageBool(storageKey, false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const sidebarW = collapsed ? "sidebarCollapsed" : "sidebarExpanded";

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
            <Drawer.Content bg="#1e1e23" color="#7c7c7c">
              <Drawer.Header borderBottomWidth="1px" borderBottomColor="black">
                <Drawer.Title color="white">{UI_TEXT.app.menu}</Drawer.Title>
                <Drawer.CloseTrigger color="white" />
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
          <IconButton
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Icon as={LuMenu} />
          </IconButton>
        </MobileMenuButtonWrap>
      </Box>
    </>
  );
}
