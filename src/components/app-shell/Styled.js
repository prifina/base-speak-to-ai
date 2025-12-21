"use client"

import { chakra, useRecipe } from "@chakra-ui/react"

/**
 * Small helpers to keep styling centralized via recipes.
 */

export function SideNavRoot(props) {
  const recipe = useRecipe({ key: "sideNav" })
  return <chakra.div css={recipe()} {...props} />
}

export function SideNavHeader(props) {
  const recipe = useRecipe({ key: "sideNavHeader" })
  const [recipeProps, rest] = recipe.splitVariantProps(props)
  return <chakra.div css={recipe(recipeProps)} {...rest} />
}

export function NavItem(props) {
  const recipe = useRecipe({ key: "navItem" })
  const [recipeProps, rest] = recipe.splitVariantProps(props)
  return <chakra.div css={recipe(recipeProps)} {...rest} />
}

export function FloatingMenuWrap(props) {
  const recipe = useRecipe({ key: "floatingMenuWrap" })
  return <chakra.div css={{ position: "fixed", top: 4, right: 4, zIndex: 1000, ...recipe() }} {...props} />
}

export function MobileMenuButtonWrap(props) {
  const recipe = useRecipe({ key: "mobileMenuButton" })
  return <chakra.div css={recipe()} {...props} />
}

export function UserMenuAvatar(props) {
  const recipe = useRecipe({ key: "userMenuAvatar" })
  return <chakra.div css={recipe()} {...props} />
}
