"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InsightsPage() {
  //console.log("HERE,... IS THIS OK");
  const router = useRouter();

  useEffect(() => {
    router.replace("/insights/daily-report");
  }, [router]);

  return null;
}
