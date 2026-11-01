# Room Availability Checker

A single-page tool that lets someone pick a room, choose a time window and see whether the room is free. It covers Assignment #04's room filtering: attendee capacity, required equipment and clear empty states.

The app uses four fictional rooms and their bookings. It only checks availability. It does not create bookings, log users in or store data.

## Setup

Requirements: Node.js 18 or newer and npm.

```bash
npm install
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm test` | Runs the full Vitest suite once. |
| `npm run typecheck` | Runs TypeScript against the app sources and tests. |
| `npm run build` | Produces a production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint across the project. |

## Fixed demo time

The app does not read the real clock. Every check uses a fixed "now" of **09:00** (540 minutes after midnight), so results are repeatable. Start times earlier than 09:00 are treated as in the past, and the current time is shown at the top of the page as a demo value.

## Using the room filters

- **Attendees** must be a whole number of 1 or more. While the entry is empty or invalid, the field shows a message, the availability check is disabled and no result is shown. The room list keeps using the last valid number.
- **Equipment** (projector, whiteboard, computers) narrows the room list. A room must have every ticked item. If nothing is ticked, equipment is not restricted.
- **Room list** shows each room's seat count. Blocked rooms stay in the list, are labelled "(blocked)" and always return Unavailable.
- **No matches** shows a "No rooms match your requirements" message and disables the room selector.
- **Selection** is kept when the room still matches the filters. Otherwise it is cleared and you must choose a room again.
- **Results** are cleared whenever the attendees, equipment, room, start time or end time change.
- Once a room is selected, its seat count and equipment appear below the selector, followed by its timeline and bookings. Nothing room-specific is shown until a room is chosen.

Booking rules: times use 24-hour format from 00:00 to 24:00, the end must be after the start, and a check may last at most 120 minutes.

## Project structure

```
src/
  main.tsx, App.tsx          App entry point and page layout
  components/
    RoomChecker.tsx          Page-level state: filters, selection, times, result
    RoomFilters.tsx          Attendees input and equipment checkboxes
    ResultCard.tsx           Available / Unavailable result display
    Timeline.tsx             Daily timeline for the selected room
    *.test.tsx               Integration tests using the real data and logic
  lib/
    data.ts                  Fictional rooms, equipment labels and bookings
    types.ts                 Shared types (Room, Booking, Equipment, results)
    time.ts                  Time parsing, formatting and the fixed demo time
    availability.ts          Availability rules (blocked rooms, overlaps, limits)
    filterRooms.ts           Pure filtering (capacity, equipment) and attendee parsing
    *.test.ts                Unit tests for each logic module
```

Logic lives in `src/lib`, which has no React dependency. Components only read those modules and display their results.

## Tests

`npm test` runs all four test files:

| File | Covers |
| --- | --- |
| `src/lib/time.test.ts` | Time parsing and formatting |
| `src/lib/availability.test.ts` | Availability rules, blocked rooms, duration limits |
| `src/lib/filterRooms.test.ts` | Capacity and equipment filtering, attendee validation |
| `src/components/RoomChecker.test.tsx` | Filter flow, selection rules, empty state, result clearing, blocked rooms |

The component tests run in jsdom and use the real room data.

## Limitations

- **No saved data.** Bookings are fictional and fixed in `src/lib/data.ts`. Nothing is saved between visits and no booking can be created.
- **Fixed time.** The checks always use 09:00, not the real time of day.
- **No accounts.** Anyone can use the tool, and there is no login or permission model.
- **Equipment list is fixed.** Only projector, whiteboard and computers are supported.
- **Clearing attendees drops the room selection only when the value becomes valid and no longer matches.** While the field is empty or invalid, the selected room stays.
- **Browser behaviour is untested here.** The automated tests cover logic and component behaviour in jsdom. Layout, responsiveness and visual details have not been checked in a real browser.
