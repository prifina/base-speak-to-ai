import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import {
  navItemRecipe,
  sideNavRecipe,
  sideNavHeaderRecipe,
  floatingMenuWrapRecipe,
  mobileMenuButtonRecipe,
  userMenuAvatarRecipe,
} from "./recipes"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" },
        body: { value: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }
      },
      sizes: {
        sidebarCollapsed: { value: "72px" },
        sidebarExpanded: { value: "260px" }
      }
    },
    semanticTokens: {
      colors: {
        // App surfaces
        "app.bg": { value: { base: "white", _dark: "#0B0F19" } },
        "app.fg": { value: { base: "#0F172A", _dark: "#E5E7EB" } },
        "app.muted": { value: { base: "#64748B", _dark: "#94A3B8" } },

        // Sidebar
        "sidebar.bg": { value: "#1e1e23" },
        "sidebar.border": { value: "black" },

        // Nav items
        "nav.fg": { value: "#7c7c7c" },
        "nav.hoverBg": { value: { base: "#F1F5F9", _dark: "#121C33" } },
        "nav.activeBg": { value: { base: "#E2E8F0", _dark: "#182447" } },
        "nav.activeFg": { value: { base: "#0F172A", _dark: "#FFFFFF" } },
        "nav.activeStripe": { value: { base: "#2563EB", _dark: "#60A5FA" } },

        // Focus ring
        focusRing: { value: { base: "#2563EB", _dark: "#60A5FA" } },
      },
    },
    recipes: {
      navItem: navItemRecipe,
      sideNav: sideNavRecipe,
      sideNavHeader: sideNavHeaderRecipe,
      floatingMenuWrap: floatingMenuWrapRecipe,
      mobileMenuButton: mobileMenuButtonRecipe,
      userMenuAvatar: userMenuAvatarRecipe,
    },
    slotRecipes: {
      field: {
        slots: ["label"],
        base: {},
        variants: {
          style: {
            bold: {
              label: {
                fontWeight: 700,
                fontSize: "16px",
              },
            },
          },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "app.bg",
      color: "app.fg",
    },
  },
})

export const system = createSystem(defaultConfig, config)
