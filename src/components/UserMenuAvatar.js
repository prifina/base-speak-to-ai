"use client"

import { Icon, IconButton } from "@chakra-ui/react"
import { IoPersonCircle } from "react-icons/io5"
import { UserMenuAvatar as StyledAvatar } from "@/components/app-shell/Styled"

export function UserMenuAvatar(props) {
  return (
    <IconButton 
      aria-label="User menu" 
      variant="subtle" 
      size="md" 
      p={0} 
      bg="transparent" 
      _focusVisible={{ outline: "none" }}
      {...props}
    >
      <StyledAvatar>
        <Icon as={IoPersonCircle} boxSize={{ base: "40px", md: "80px" }} />
      </StyledAvatar>
    </IconButton>
  )
}
