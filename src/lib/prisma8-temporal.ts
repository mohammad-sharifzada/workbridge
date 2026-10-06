/**
 * Strategy A: Prisma 8 `timestamp-temporal` (Temporal.PlainDateTime) ↔ Date at boundaries.
 * Shared by all P8→legacy mappers and P8 write inputs — do not duplicate this conversion elsewhere.
 */
import { Temporal } from "temporal-polyfill";

/** Structural match for Prisma 8 Temporal.PlainDateTime without a global Temporal namespace. */
export type PlainDateTimeLike = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

/** UTC interpretation for timestamp-without-TZ (same as validated User/SeekerProfile mapping). */
export function plainDateTimeToDate(value: PlainDateTimeLike): Date {
  return new Date(
    Date.UTC(
      value.year,
      value.month - 1,
      value.day,
      value.hour,
      value.minute,
      value.second,
      value.millisecond,
    ),
  );
}

export function optionalPlainDateTimeToDate(
  value: PlainDateTimeLike | null | undefined,
): Date | null {
  return value == null ? null : plainDateTimeToDate(value);
}

/**
 * Encode a JS Date as Temporal.PlainDateTime for P8 write inputs (UTC components).
 * Requires temporal-polyfill (loaded via src/prisma/db.ts).
 */
export function dateToPlainDateTime(value: Date): PlainDateTimeLike {
  return Temporal.PlainDateTime.from({
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
    hour: value.getUTCHours(),
    minute: value.getUTCMinutes(),
    second: value.getUTCSeconds(),
    millisecond: value.getUTCMilliseconds(),
  });
}

export function optionalDateToPlainDateTime(
  value: Date | null | undefined,
): PlainDateTimeLike | null {
  return value == null ? null : dateToPlainDateTime(value);
}
