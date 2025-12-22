import { defineRecipe } from "@chakra-ui/react"

/**
 * Custom recipe for sidebar nav items.
 * Variants:
 * - active: show stripe + stronger background
 * - collapsed: center icon, reduce padding
 */
export const navItemRecipe = defineRecipe({
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: "10",
    borderRadius: "md",
    px: "3",
    gap: "3",
    fontWeight: "medium",
    color: "nav.fg",
    transitionProperty: "background, color",
    transitionDuration: "fast",
    _hover: {
      bg: "nav.hoverBg",
    },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "focusRing",
      outlineOffset: "2px",
    },
  },
  variants: {
    active: {
      true: {
        bg: "nav.activeBg",
        color: "nav.activeFg",
      },
    },
    collapsed: {
      true: {
        justifyContent: "center",
        px: "0",
        gap: "0",
      },
    },
  },
})

export const sideNavRecipe = defineRecipe({
  base: {
    height: "100dvh",
    bg: "sidebar.bg",
    borderRightWidth: "1px",
    borderRightColor: "sidebar.border",
    position: "sticky",
    top: "0",
    transitionProperty: "width",
    transitionDuration: "fast",
  },
})

export const sideNavHeaderRecipe = defineRecipe({
  base: {
    px: "3",
    py: "3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  variants: {
    collapsed: {
      true: {
        justifyContent: "center",
        px: "2",
      },
    },
  },
})

export const floatingMenuWrapRecipe = defineRecipe({
  base: {
    position: "fixed",
    top: "4",
    right: "4",
    zIndex: "overlay",
  },
})

export const mobileMenuButtonRecipe = defineRecipe({
  base: {
    position: "fixed",
    top: "4",
    left: "4",
    zIndex: "overlay",
  },
})

export const userMenuAvatarRecipe = defineRecipe({
  base: {
    width: "fit-content",
    borderRadius: "100px",
    bg: "white",
    zIndex: 99,
    color: "#E9E7F8",
    cursor: "pointer",
    transition: "color 0.2s",
    _hover: {
      color: "#D1CFEA",
    },
  },
})
