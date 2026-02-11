"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Text, Flex } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";

export default function InsightsLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { id: "sessions", label: "Sessions", path: "/insights/sessions" },
    { id: "live-feed", label: "Live Feed", path: "/insights/live-feed" },
    { id: "daily-report", label: "Daily Report", path: "/insights/daily-report" },
  ];

  const currentTab = tabs.findIndex((tab) => pathname === tab.path);

  return (
    <Flex flexDir="column" gap="40px" p="28px">
      <Box pl={{ base: "42px", md: "0" }}>
        <Text textStyle="pageTitle">Insights</Text>
      </Box>
      <Tabs.Root
        value={tabs[currentTab]?.id || tabs[0].id}
        onValueChange={(e) => {
          const tab = tabs.find((t) => t.id === e.value);
          if (tab) router.push(tab.path);
        }}
      >
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
      <Box>{children}</Box>
    </Flex>
  );
}
