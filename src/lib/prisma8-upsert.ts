/**
 * Prisma 8 `upsert({ conflictOn })` accepts unique columns at runtime (SQL ON CONFLICT),
 * but the generated Contract types currently only advertise the primary key `{ id }`.
 * Use this cast at call sites — do not invent find→create/update for unique upserts.
 */
export function conflictOn<T extends Record<string, string>>(target: T): { id: string } {
  return target as unknown as { id: string };
}
