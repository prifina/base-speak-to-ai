"use client";

import { Box } from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell/AppShell";
import { LuUser, LuCreditCard } from "react-icons/lu";

const accountNavItems = [
  {
    key: "account",
    label: "Account",
    href: "/account",
    icon: LuUser,
  },
  {
    key: "subscription",
    label: "Subscription",
    href: "/subscription",
    icon: LuCreditCard,
  },
];

export default function AccountLayout({ children }) {
  return (
    <AppShell navItems={accountNavItems} storageKey="sidebar-collapsed-account">
      <Box>{children}</Box>
    </AppShell>
  );
}
