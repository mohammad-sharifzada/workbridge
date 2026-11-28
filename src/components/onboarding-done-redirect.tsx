"use client";

import { useEffect } from "react";
import { useRouter } from "@/modules_outsourced/module_localizationRouting";

export function OnboardingDoneRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/jobs");
      router.refresh();
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
