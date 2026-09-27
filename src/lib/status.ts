import type { ReadinessStatus } from "@prisma/client";

export type ReadinessInput = {
  hasBankAccount: boolean | null | undefined;
  hasTaxId: boolean | null | undefined;
  hasWorkPermit: boolean | null | undefined;
};

export type MissingRequirement = "bank" | "taxId" | "workPermit";

export function computeReadiness(input: ReadinessInput): {
  status: ReadinessStatus;
  missing: MissingRequirement[];
  readyCount: number;
} {
  const checks: { key: MissingRequirement; value: boolean | null | undefined }[] = [
    { key: "bank", value: input.hasBankAccount },
    { key: "taxId", value: input.hasTaxId },
    { key: "workPermit", value: input.hasWorkPermit },
  ];

  const missing = checks
    .filter((c) => c.value !== true)
    .map((c) => c.key);

  const readyCount = 3 - missing.length;

  let status: ReadinessStatus;
  if (readyCount === 3) status = "GREEN";
  else if (readyCount >= 1) status = "YELLOW";
  else status = "RED";

  // Unknown (null) counts as missing — work permit false/null is critical
  if (input.hasWorkPermit === false) {
    status = status === "GREEN" ? "YELLOW" : status;
    if (!missing.includes("workPermit")) missing.push("workPermit");
  }

  return { status, missing, readyCount: checks.filter((c) => c.value === true).length };
}

export const STATUS_COLORS = {
  GREEN: { bg: "#E8F5E9", fg: "#1B5E20", border: "#43A047", label: "green" },
  YELLOW: { bg: "#FFF8E1", fg: "#F57F17", border: "#FBC02D", label: "yellow" },
  RED: { bg: "#FFEBEE", fg: "#B71C1C", border: "#E53935", label: "red" },
} as const;
