"use client";

import React from "react";
import { Input, VisuallyHidden } from "@chakra-ui/react";

/**
 * AntiBotFields
 * - ab_token: signed token from server
 * - ab_started: timestamp (signal only)
 * - honeypot: visually hidden input that common bots tend to fill
 *
 * Props:
 * - token (string)         required
 * - action (string)        recommended (must match token payload)
 * - honeypotName (string)  optional, default "profile_url"
 * - honeypotLabel (string) optional, label text
 */
export default function AntiBotFields({
  token,
  action,
  honeypotName = "profile_url",
  honeypotLabel = "Profile URL",
}) {
  const startedAtRef = React.useRef(Date.now());

  return (
    <>
      <Input type="hidden" name="ab_token" value={token} />
      <Input type="hidden" name="ab_action" value={action || ""} />
      <Input type="hidden" name="ab_started" value={String(startedAtRef.current)} />

      <VisuallyHidden aria-hidden="true">
        <label htmlFor={honeypotName}>{honeypotLabel}</label>
        <Input
          id={honeypotName}
          name={honeypotName}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          aria-hidden="true"
        />
      </VisuallyHidden>
    </>
  );
}
