export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockedReason?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes since 00:00
  end: number; // minutes since 00:00
  owner: string;
}

export interface Interval {
  start: number;
  end: number;
}

export type AvailabilityStatus = "available" | "unavailable";

export interface AvailabilityResult {
  status: AvailabilityStatus;
  reason?: string;
}
