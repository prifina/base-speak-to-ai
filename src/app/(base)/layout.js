"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  Button,
  Text,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AuthContext } from "@/app/providers/AuthProvider";
import useStore from "@/lib/sessionStore";
import { useShallow } from "zustand/react/shallow";
import { useAuthFetch } from "@/lib/useAuthFetch";
import {
  ProfileIcon,
  KnowledgeBaseIcon,
  InsightsIcon,
} from "@/components/CustomIcons";
import { UI_TEXT } from "@/lib/uiStrings";
//import { useWebSocket } from "@/hooks/useWebSocket";

//import useStore from "@/lib/sessionStore";

const navItems = [
  {
    key: "profile",
    label: UI_TEXT.profile.sectionTitle,
    href: "/home",
    icon: ProfileIcon,
  },
  {
    key: "knowledge",
    label: UI_TEXT.knowledgeBase.sectionTitle,
    href: "/knowledge",
    icon: KnowledgeBaseIcon,
  },
  {
    key: "insights",
    label: UI_TEXT.insights.sectionTitle,
    href: "/insights/daily-report",
    icon: InsightsIcon,
  },
];

export default function BaseLayout({ children }) {
  const { loaded: authLoaded, cognitoId } = useContext(AuthContext);
  const router = useRouter();
  const authFetch = useAuthFetch();
  const { knowledgebaseId } = useStore(
    useShallow((state) => ({
      knowledgebaseId: state.knowledgebaseId,
    }))
  );
  const [userStatus, setUserStatus] = useState(null);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    async function checkUserStatus() {
      if (!authLoaded || !knowledgebaseId) return;
      
      try {
        const response = await authFetch(
          `/api/user-knowledgebase?knowledgebaseId=${knowledgebaseId}&opt=STATUS`
        );
        const data = await response.json();
        setUserStatus(data.user?.status);
      } catch (error) {
        console.error("Failed to fetch user status:", error);
      } finally {
        setStatusLoaded(true);
      }
    }

    checkUserStatus();
  }, [authLoaded, knowledgebaseId, authFetch]);

  const isBlocked = userStatus === "Suspended" || userStatus === "Terminated";
  const docLink = userStatus === "Suspended" 
    ? "https://prifina.com/service-suspended"
    : "https://prifina.com/service-terminated";

  if (statusLoaded && isBlocked) {
    return (
      <Dialog.Root open={true} closeOnOverlayClick={false} closeOnEsc={false} trapFocus preventScroll>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              {cognitoId ? "Subscription Required" : "Signup Required"}
            </Dialog.Header>
            <Dialog.Body>
              <VStack spacing={4} align="stretch">
                <Text>
                  Your AI-Status is <strong>{userStatus}</strong> and
                  before you can continue, you need to{" "}
                  <strong>{cognitoId ? "subscribe" : "sign up"}</strong>.
                </Text>
                <ChakraLink href={docLink} color="blue.500" target="_blank">
                  {`Learn more about ${userStatus.toLowerCase()} status`}
                </ChakraLink>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer flexDirection="column" gap={2}>
              <Button
                colorScheme="blue"
                width="100%"
                onClick={() => router.push(cognitoId ? "/subscription" : "/signup")}
              >
                {cognitoId ? "Subscribe Here" : "Signup Here"}
              </Button>
              <Button
                variant="outline"
                width="100%"
                onClick={() => router.push("/")}
              >
                Home
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }
  return (
    <AppShell navItems={navItems} storageKey="sidebar-collapsed-admin">
      {children}
    </AppShell>
  );
}
