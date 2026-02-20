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
  Input,
  Separator,
  Stack,
  Drawer,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
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
  LuExternalLink,
  LuX,
} from "react-icons/lu";
import { UI_TEXT } from "@/lib/uiStrings";
import { EVALS } from "@/lib/appConfig";
import useStore from "@/lib/sessionStore";

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

function SideNavContent({ items, collapsed, onToggleCollapsed, onNavigate, isAdmin }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const clearManagedUser = useStore((state) => state.clearManagedUser);
  const setManagedUser = useStore((state) => state.setManagedUser);
  const managedUserId = useStore((state) => state.managedUser.userId);
  const isManaging = useStore((state) => state.managedUser.isManaging);

  React.useEffect(() => {
    setMounted(true);
    // Set input value to managed userId if managing
    if (isManaging && managedUserId) {
      setSearchValue(managedUserId);
    }
  }, [isManaging, managedUserId]);

  const handleClearManaged = () => {
    clearManagedUser();
    setSearchValue("");
    window.location.href = "/home";
  };

  const handleSetManagedUser = async () => {
    if (!searchValue.trim()) return;
    
    setLoading(true);
    try {
      const userId = searchValue.trim();
      const res = await fetch(`/api/validate-managed-user?userId=${userId}`);
      
      if (res.status === 404) {
        toaster.create({
          title: "User not available",
          description: "User not found or not managed",
          type: "error",
        });
        setLoading(false);
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        
        // Check network access on client side
        const isAdmin = useStore.getState().isAdmin || [];
        const networkName = data.networkId?.startsWith("x_") ? data.networkId.slice(2) : null;
        
        if (!networkName || !isAdmin.some(group => group === `admin_${networkName}`)) {
          toaster.create({
            title: "Access denied",
            description: "You are not admin of this user's network",
            type: "error",
          });
          setLoading(false);
          return;
        }
        
        setManagedUser(data.userId, data.knowledgebaseId);
        toaster.create({
          title: "Managing user",
          description: `Now managing ${data.userId}`,
          type: "success",
        });
        // Force full page reload to load managed user data
        window.location.href = "/home";
      }
    } catch (error) {
      console.error("Error setting managed user:", error);
      toaster.create({
        title: "Error",
        description: "Failed to validate user",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSetManagedUser();
    }
  };

  const go = (href) => {
    if (onNavigate) onNavigate();
    router.push(href);
    router.refresh();
  };

  return (
    <Flex direction="column" h="100dvh">
      <SideNavHeader collapsed={collapsed}>
        {collapsed ? (
          <Flex direction="column" w="full" align="center" gap={2}>
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
            <IconButton
              aria-label="Expand sidebar"
              variant="ghost"
              size="sm"
              onClick={onToggleCollapsed}
              color="white"
            >
              <Icon as={LuChevronRight} />
            </IconButton>
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

      <Stack gap="5" p="2" flex="1" overflowY="auto">
        {items.map((it, index) => {
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

          const tooltipItem = (
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

          // Show separator and input after "insights" item if admin
          if (it.key === "insights" && mounted && isAdmin) {
            return (
              <React.Fragment key={it.key}>
                {tooltipItem}
                <HStack mt="3">
                  <Separator flex="1" />
                  <Text flexShrink="0" fontSize="sm" color="gray.400">Managed</Text>
                  <Separator flex="1" />
                </HStack>
                {!collapsed && (
                  <Box position="relative">
                    <Input
                      placeholder="Enter user ID..."
                      size="sm"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      pr="8"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                    />
                    {searchValue && (
                      <IconButton
                        aria-label="Clear"
                        size="xs"
                        variant="ghost"
                        position="absolute"
                        right="1"
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={handleClearManaged}
                      >
                        <Icon as={LuX} />
                      </IconButton>
                    )}
                  </Box>
                )}
              </React.Fragment>
            );
          }

          return tooltipItem;
        })}
      </Stack>

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
            justify={collapsed ? "center" : "space-between"}
          >
            {!collapsed && <Text truncate>{UI_TEXT.app.aiTwinGuide}</Text>}
            <Icon as={LuExternalLink} boxSize="20px" />
          </HStack>
        </NavItem>
      </Box>
    </Flex>
  );
}

export function SideNav({ items, storageKey = "sidebar-collapsed" }) {
  const [collapsed, setCollapsed] = useLocalStorageBool(storageKey, false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAdmin = useStore((state) => Array.isArray(state.isAdmin) && state.isAdmin.length > 0);

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
            isAdmin={isAdmin}
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
                  isAdmin={isAdmin}
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
