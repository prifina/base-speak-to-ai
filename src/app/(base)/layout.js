"use client";

import { AppShell } from "@/components/app-shell/AppShell";
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
  /*
  const { setSocketUpdate, setConnectionId } = useStore((s) => ({
    setSocketUpdate: s.setSocketUpdate,
    setConnectionId: s.setConnectionId,
  }));

    
    useWebSocket({
      site,
      enabled: allowWebSocket,
      setConnectionId: setConnectionId,
      onSocketUpdate: setSocketUpdate,
      // onUploadOK: stableOnUploadOK,
      // onUploadError: stableOnUploadError
    });
*/
  return (
    <AppShell navItems={navItems} storageKey="sidebar-collapsed-admin">
      {children}
    </AppShell>
  );
}
