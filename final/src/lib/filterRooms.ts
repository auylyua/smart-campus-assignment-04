import type { Equipment, Room } from "./types";

export interface RoomRequirements {
  attendees: number;
  equipment: Equipment[];
}

export function parseAttendees(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const count = Number(trimmed);
  return count > 0 ? count : null;
}

export function filterRooms(rooms: Room[], requirements: RoomRequirements): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= requirements.attendees &&
      requirements.equipment.every((item) => room.equipment.includes(item)),
  );
}
