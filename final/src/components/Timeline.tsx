import type { Booking } from "@/lib/types";
import { MINUTES_PER_DAY, formatTime } from "@/lib/time";

interface TimelineProps {
  bookings: Booking[];
  now: number;
  candidateStart?: number;
  candidateEnd?: number;
}

export function Timeline({ bookings, now, candidateStart, candidateEnd }: TimelineProps) {
  const hourMarks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">Daily timeline</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-400" /> Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Candidate
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400" /> Now {formatTime(now)}
          </span>
        </div>
      </div>

      <div className="relative h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-1 bottom-1 rounded-sm bg-rose-400/80 border border-rose-500/40 flex items-center justify-center text-[10px] text-white font-medium overflow-hidden whitespace-nowrap px-1"
            style={{
              left: `${(b.start / MINUTES_PER_DAY) * 100}%`,
              width: `${((b.end - b.start) / MINUTES_PER_DAY) * 100}%`,
            }}
            title={`${formatTime(b.start)}–${formatTime(b.end)}: ${b.owner}`}
          >
            {b.end - b.start >= 45 ? b.owner : ""}
          </div>
        ))}

        {candidateStart !== undefined && candidateEnd !== undefined && candidateEnd > candidateStart && (
          <div
            className="absolute top-1 bottom-1 rounded-sm bg-emerald-400/70 border border-emerald-500/50"
            style={{
              left: `${(candidateStart / MINUTES_PER_DAY) * 100}%`,
              width: `${((candidateEnd - candidateStart) / MINUTES_PER_DAY) * 100}%`,
            }}
          />
        )}

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-500"
          style={{ left: `${(now / MINUTES_PER_DAY) * 100}%` }}
        >
          <span className="absolute -top-0 -translate-x-1/2 -translate-y-0 text-[9px] text-amber-600 font-semibold bg-amber-50 px-1 rounded">
            now
          </span>
        </div>

        {hourMarks.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-slate-200"
            style={{ left: `${(h * 60 / MINUTES_PER_DAY) * 100}%` }}
          />
        ))}
      </div>

      <div className="relative h-4 mt-1 text-[10px] text-slate-400">
        {[0, 6, 12, 18, 24].map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2"
            style={{ left: `${(h * 60 / MINUTES_PER_DAY) * 100}%` }}
          >
            {h.toString().padStart(2, "0")}:00
          </span>
        ))}
      </div>
    </div>
  );
}
