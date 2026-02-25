"use client";

import { Box } from "@chakra-ui/react";
import { AppShell } from "@/components/app-shell/AppShell";
import { LuUser, LuCreditCard, LuGlobe } from "react-icons/lu";

const accountNavItems = [
  {
    key: "account",
    label: "Account Details",
    href: "/account",
    icon: LuUser,
  },
  {
    key: "languages",
    label: "Languages",
    href: "/languages",
    icon: LuGlobe,
  },
  {
    key: "subscription",
    label: "Billing & plan",
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
