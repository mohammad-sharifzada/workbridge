import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkBridge",
  description: "Job marketplace and onboarding for work in Germany",
};

/** Root layout – html/lang/dir kommen aus [locale]/layout.tsx */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
