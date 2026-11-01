import { describe, expect, it } from "vitest";
import { checkAvailability } from "@/lib/availability";
import type { Booking, Room } from "@/lib/types";

const NOW = 540;

function buildFixtures(): { rooms: Room[]; bookings: Booking[] } {
  const rooms: Room[] = [
    { id: "R-A101", name: "Athena Hall 101", building: "Athena Hall", capacity: 32, equipment: [], blocked: false },
    {
      id: "R-B220",
      name: "Babbage Lab 220",
      building: "Babbage Lab",
      capacity: 24,
      equipment: [],
      blocked: true,
      blockedReason: "Maintenance — HVAC out of service",
    },
    { id: "R-C310", name: "Curie Auditorium 310", building: "Curie Wing", capacity: 120, equipment: [], blocked: false },
  ];
  const bookings: Booking[] = [
    { id: "B-3", roomId: "R-A101", start: 900, end: 960, owner: "Study Group" },
    { id: "B-4", roomId: "R-C310", start: 600, end: 720, owner: "Guest Lecture" },
    { id: "B-1", roomId: "R-A101", start: 540, end: 600, owner: "Intro to Algorithms" },
    { id: "B-2", roomId: "R-A101", start: 720, end: 780, owner: "Faculty Meeting" },
    { id: "B-5", roomId: "R-C310", start: 840, end: 960, owner: "Department Seminar" },
  ];
  return { rooms, bookings };
}

describe("checkAvailability: valid requests (AC1)", () => {
  it("accepts a free slot that starts after now and fits the day", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 600, end: 660 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });

  it("accepts a start one minute after now", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 541, end: 600 }, rooms[2], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });
});

describe("checkAvailability: start must be after now (AC1)", () => {
  it("rejects a start equal to now", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 540, end: 600 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "unavailable", reason: "Start time must be in the future." });
  });

  it("rejects a start earlier than now", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 480, end: 540 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "unavailable", reason: "Start time must be in the future." });
  });
});

describe("checkAvailability: zero and reversed intervals (AC1)", () => {
  it("rejects a zero-length interval", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 600, end: 600 }, rooms[0], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Start time must be earlier than end time.",
    });
  });

  it("rejects a reversed interval", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 660, end: 600 }, rooms[0], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Start time must be earlier than end time.",
    });
  });
});

describe("checkAvailability: day bounds (AC1)", () => {
  it("rejects a start before 00:00", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: -1, end: 60 }, rooms[0], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Times must be between 00:00 and 24:00.",
    });
  });

  it("rejects an end after 24:00", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 1380, end: 1441 }, rooms[0], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Times must be between 00:00 and 24:00.",
    });
  });

  it("accepts an end of exactly 24:00", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 1380, end: 1440 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });
});

describe("checkAvailability: duration limit of 120 minutes (AC2)", () => {
  it("accepts exactly 120 minutes", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 960, end: 1080 }, rooms[2], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });

  it("rejects 121 minutes", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 960, end: 1081 }, rooms[2], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Bookings cannot exceed 120 minutes. Your request is 121 minutes.",
    });
  });
});

describe("checkAvailability: blocked rooms (AC3)", () => {
  it("rejects a valid slot in a blocked room and gives the blocked reason", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 600, end: 660 }, rooms[1], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Room is blocked: Maintenance — HVAC out of service",
    });
  });
});

describe("checkAvailability: touching endpoints (AC4)", () => {
  it("allows a slot that ends exactly when an existing booking starts", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 660, end: 720 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });

  it("allows a slot that starts exactly when an existing booking ends", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 780, end: 840 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });
});

describe("checkAvailability: overlaps (AC4)", () => {
  it("rejects a slot that overlaps the start of a booking", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 700, end: 750 }, rooms[0], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Overlaps existing booking 12:00–13:00 (Faculty Meeting).",
    });
  });

  it("rejects a slot that fully contains a booking", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 700, end: 800 }, rooms[0], bookings, NOW);
    expect(result).toEqual({
      status: "unavailable",
      reason: "Overlaps existing booking 12:00–13:00 (Faculty Meeting).",
    });
  });
});

describe("checkAvailability: booking isolation by room (AC4)", () => {
  it("ignores bookings that belong to other rooms", () => {
    const { rooms, bookings } = buildFixtures();
    const result = checkAvailability({ start: 630, end: 690 }, rooms[0], bookings, NOW);
    expect(result).toEqual({ status: "available" });
  });
});

describe("checkAvailability: data preservation (AC5)", () => {
  it("leaves booking contents and order unchanged, including for an unsorted list", () => {
    const { rooms, bookings } = buildFixtures();
    const bookingsBefore = structuredClone(bookings);
    const idsBefore = bookings.map((b) => b.id);

    checkAvailability({ start: 660, end: 720 }, rooms[0], bookings, NOW);
    checkAvailability({ start: 700, end: 750 }, rooms[0], bookings, NOW);

    expect(bookings).toEqual(bookingsBefore);
    expect(bookings.map((b) => b.id)).toEqual(idsBefore);
  });

  it("leaves room contents unchanged", () => {
    const { rooms, bookings } = buildFixtures();
    const roomsBefore = structuredClone(rooms);

    checkAvailability({ start: 600, end: 660 }, rooms[1], bookings, NOW);

    expect(rooms).toEqual(roomsBefore);
  });
});
