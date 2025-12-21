"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { LuBookOpen, LuUsers, LuFileText } from "react-icons/lu";

const navItems = [
  {
    key: "dash",
    label: "Dashboard",
    href: "/dashboard",
    icon: LuBookOpen,
  },
  { key: "users", label: "Users", href: "/users", icon: LuUsers },
  { key: "reports", label: "Reports", href: "/reports", icon: LuFileText },
];

export default function BaseLayout({ children }) {
  return (
    <AppShell navItems={navItems} storageKey="sidebar-collapsed-admin">
      {children}
    </AppShell>
  );
}
