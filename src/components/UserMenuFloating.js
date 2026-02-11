"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  HStack,
  VStack,
  Icon,
  Menu,
  Portal,
  SimpleGrid,
  Text,
  Image,
} from "@chakra-ui/react";
import { FloatingMenuWrap } from "@/components/app-shell/Styled";
import { UserMenuAvatar } from "@/components/UserMenuAvatar";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { signOut } from "aws-amplify/auth";
import { EVALS } from "@/lib/appConfig";
import useStore from "@/lib/sessionStore";
import { useShallow } from "zustand/react/shallow";

import { UI_TEXT } from "@/lib/uiStrings";

export function UserMenuFloating() {
  const router = useRouter();
  const { userId } = useStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  );

  const APPS = [
    {
      key: "base",
      label: UI_TEXT.app.title,
      href: "/home",
      icon: "/assets/prifina_icons/base_app.svg",
    },
    ...(userId ? [{
      key: "ai-twin",
      label: "AI Twin",
      href: `${process.env.NEXT_PUBLIC_SPEAK_TO_USER}/${userId}`,
      icon: "/assets/prifina_icons/ai_twin.svg",
      external: true,
    }] : []),
    {
      key: "account",
      label: "Account",
      href: "/account",
      icon: "/assets/prifina_icons/prifina_account.svg",
    },
  ];

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
                {UI_TEXT.app.allApps}
              </Text>

              <SimpleGrid columns={2} gap="2">
                {APPS.map((app) => (
                  <Menu.Item
                    key={app.key}
                    value={app.key}
                    borderRadius="md"
                    p="2"
                    onClick={() => app.external ? window.open(app.href, "_blank") : router.push(app.href)}
                  >
                    <VStack gap="2">
                      <Image src={app.icon} alt={app.label} boxSize="8" />
                      <Text fontSize="sm">{app.label}</Text>
                    </VStack>
                  </Menu.Item>
                ))}
              </SimpleGrid>

              <Menu.Separator my="3" />

              <Menu.Item
                value="help"
                onClick={() => window.open(EVALS.baseDoc, "_blank")}
              >
                <HStack gap="3">
                  <Icon as={IoMdHelpCircleOutline} boxSize="5" />
                  <Text fontSize="sm">{UI_TEXT.app.help}</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item value="logout" onClick={handleLogout}>
                <HStack gap="3">
                  <Icon as={MdLogout} boxSize="5" />
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
