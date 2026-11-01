import { CalendarCheck } from "lucide-react";
import { RoomChecker } from "@/components/RoomChecker";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-600 text-white">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Smart Campus Room Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Check whether a room is free for your chosen time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        <RoomChecker />
      </main>

      <footer className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-center text-xs text-slate-400">
        Fictional data for demonstration. Availability check only — no bookings are created.
      </footer>
    </div>
  );
}

export default App;
