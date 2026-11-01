import type { Booking, Room } from "./types";

export const rooms: Room[] = [
  {
    id: "R-A101",
    name: "Athena Hall 101",
    building: "Athena Hall",
    capacity: 32,
    blocked: false,
  },
  {
    id: "R-B220",
    name: "Babbage Lab 220",
    building: "Babbage Lab",
    capacity: 24,
    blocked: true,
    blockedReason: "Maintenance — HVAC out of service",
  },
  {
    id: "R-C310",
    name: "Curie Auditorium 310",
    building: "Curie Wing",
    capacity: 120,
    blocked: false,
  },
  {
    id: "R-D405",
    name: "DaVinci Studio 405",
    building: "DaVinci Studios",
    capacity: 18,
    blocked: false,
  },
];

export const bookings: Booking[] = [
  { id: "B-1", roomId: "R-A101", start: 540, end: 600, owner: "Intro to Algorithms" },
  { id: "B-2", roomId: "R-A101", start: 720, end: 780, owner: "Faculty Meeting" },
  { id: "B-3", roomId: "R-A101", start: 900, end: 960, owner: "Study Group" },
  { id: "B-4", roomId: "R-C310", start: 600, end: 720, owner: "Guest Lecture: Quantum Computing" },
  { id: "B-5", roomId: "R-C310", start: 840, end: 960, owner: "Department Seminar" },
  { id: "B-6", roomId: "R-D405", start: 480, end: 540, owner: "Painting Workshop" },
  { id: "B-7", roomId: "R-D405", start: 780, end: 840, owner: "Sculpture Lab" },
];
