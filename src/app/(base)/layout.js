"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import {
  ProfileIcon,
  KnowledgeBaseIcon,
  InsightsIcon,
} from "@/components/CustomIcons";
import { UI_TEXT } from "@/lib/uiStrings";

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
    href: "/insights",
    icon: InsightsIcon,
  },
];

export default function BaseLayout({ children }) {
  return (
    <AppShell navItems={navItems} storageKey="sidebar-collapsed-admin">
      {children}
    </AppShell>
  );
}
