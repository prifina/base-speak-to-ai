"use client";
import {
  initBrowserTelemetry,
  TelemetryErrorBoundary,
} from "@prifina-dev/next-telemetry";
import { useEffect } from "react";

export function TelemetryProvider({ children }) {
  useEffect(() => {
    initBrowserTelemetry();
  }, []);

  return <TelemetryErrorBoundary>{children}</TelemetryErrorBoundary>;
}
