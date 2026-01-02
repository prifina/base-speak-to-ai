"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HStack, Icon, Menu, Portal, SimpleGrid, Text, Image } from "@chakra-ui/react";
import { FloatingMenuWrap } from "@/components/app-shell/Styled";
import { UserMenuAvatar } from "@/components/UserMenuAvatar";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { signOut } from "aws-amplify/auth";
import { EVALS } from "@/lib/appConfig";
import useStore from "@/lib/sessionStore";

import { UI_TEXT } from "@/lib/uiStrings";

const APPS = [
  { key: "base", label: UI_TEXT.app.title, href: "/home", icon: "/assets/prifina_icons/base_app.svg" },
  { key: "account", label: "Prifina Account", href: "/account", icon: "/assets/prifina_icons/prifina_account.svg" },
];

export function UserMenuFloating() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("prifina-base");
      }
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <FloatingMenuWrap>
      <Menu.Root
        positioning={{
          strategy: "fixed",
          placement: "bottom-end",
          hideWhenDetached: true,
          gutter: 16,
        }}
      >
        <Menu.Trigger asChild>
          <UserMenuAvatar />
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content p="3" minW="280px" mt="2">
              <Text fontSize="sm" fontWeight="semibold" mb="2">
                {UI_TEXT.app.menu}
              </Text>

              <SimpleGrid columns={2} gap="2">
                {APPS.map((app) => (
                  <Menu.Item
                    key={app.key}
                    value={app.key}
                    borderRadius="md"
                    p="2"
                    onClick={() => router.push(app.href)}
                  >
                    <HStack gap="3">
                      <Image src={app.icon} alt={app.label} boxSize="4" />
                      <Text fontSize="sm">{app.label}</Text>
                    </HStack>
                  </Menu.Item>
                ))}
              </SimpleGrid>

              <Menu.Separator my="3" />

              <Menu.Item
                value="help"
                onClick={() => window.open(EVALS.generalGuideDoc, "_blank")}
              >
                <HStack gap="3">
                  <Icon as={IoMdHelpCircleOutline} />
                  <Text fontSize="sm">{UI_TEXT.app.help}</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item
                value="logout"
                onClick={handleLogout}
              >
                <HStack gap="3">
                  <Icon as={MdLogout} />
                  <Text fontSize="sm">{UI_TEXT.app.logout}</Text>
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </FloatingMenuWrap>
  );
}
