"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";

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
