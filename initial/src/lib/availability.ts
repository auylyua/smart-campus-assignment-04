import type { AvailabilityResult, Booking, Interval, Room } from "./types";

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION_MINUTES = 120;

export function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailability(
  candidate: Interval,
  room: Room,
  existing: Booking[],
  now: number,
): AvailabilityResult {
  if (candidate.start < 0 || candidate.end > MINUTES_PER_DAY) {
    return { status: "unavailable", reason: "Times must be between 00:00 and 24:00." };
  }
  if (candidate.start >= candidate.end) {
    return { status: "unavailable", reason: "Start time must be earlier than end time." };
  }
  if (candidate.start <= now) {
    return { status: "unavailable", reason: "Start time must be in the future." };
  }
  const duration = candidate.end - candidate.start;
  if (duration > MAX_DURATION_MINUTES) {
    return {
      status: "unavailable",
      reason: `Bookings cannot exceed ${MAX_DURATION_MINUTES} minutes. Your request is ${duration} minutes.`,
    };
  }
  if (room.blocked) {
    return {
      status: "unavailable",
      reason: room.blockedReason
        ? `Room is blocked: ${room.blockedReason}`
        : "This room is currently blocked.",
    };
  }
  const roomBookings = existing.filter((b) => b.roomId === room.id);
  const clash = roomBookings.find((b) => intervalsOverlap(candidate, b));
  if (clash) {
    return {
      status: "unavailable",
      reason: `Overlaps existing booking ${formatTime(clash.start)}–${formatTime(clash.end)} (${clash.owner}).`,
    };
  }
  return { status: "available" };
}

export function formatTime(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}
