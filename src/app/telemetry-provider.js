"use client";
import {
  initBrowserTelemetry,
  TelemetryErrorBoundary,
} from "next-telemetry/client";
import { useEffect } from "react";

export function TelemetryProvider({ children }) {
  useEffect(() => {
    initBrowserTelemetry();
  }, []);

  return <TelemetryErrorBoundary>{children}</TelemetryErrorBoundary>;
}
