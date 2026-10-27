"use client";

export type Seat = {
  id: string;
  seatNumber: string;
  isBooked: boolean;
};

type SeatMapProps = {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelect: (seatId: string) => void;
};

export function SeatMap({ seats, selectedSeatId, onSelect }: SeatMapProps) {
  const ordered = [...seats].sort((a, b) =>
    a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }),
  );

  const rows: Seat[][] = [];
  for (let index = 0; index < ordered.length; index += 4) {
    rows.push(ordered.slice(index, index + 4));
  }

  return (
    <div className="mx-auto w-full max-w-xs rounded-[2rem] border border-[#f0d0d2] bg-gradient-to-b from-white to-[#fff7f7] p-4 shadow-inner">
      <div className="mb-4 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wide text-[#9a9aaa]">
        <span>Door</span>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d84e55]/30 text-[#d84e55]">
          ⌂
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div
            key={row.map((seat) => seat.id).join("-")}
            className="grid grid-cols-[1fr_1fr_0.7rem_1fr_1fr] gap-2"
            style={{ animationDelay: `${rowIndex * 40}ms` }}
          >
            {row.map((seat, index) => {
              const selected = seat.id === selectedSeatId;
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={seat.isBooked}
                  aria-pressed={selected}
                  onClick={() => onSelect(seat.id)}
                  style={{ gridColumn: index < 2 ? index + 1 : index + 2 }}
                  className={[
                    "h-12 rounded-xl border text-sm font-bold transition duration-200",
                    seat.isBooked
                      ? "cursor-not-allowed border-[#d9d9d9] bg-[#e4e4e4] text-[#8d8d8d]"
                      : selected
                        ? "animate-pop border-[#d84e55] bg-[#d84e55] text-white shadow-md shadow-[#d84e55]/40"
                        : "border-[#f3c4c7] bg-white text-[#3e3e52] hover:-translate-y-0.5 hover:border-[#d84e55] hover:shadow",
                  ].join(" ")}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-between text-[11px] font-medium text-[#6b6b7b]">
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded border border-[#f3c4c7] bg-white" />
          Open
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded bg-[#d84e55]" />
          Selected
        </span>
        <span className="flex items-center gap-1">
          <i className="inline-block h-3 w-3 rounded bg-[#e4e4e4]" />
          Booked
        </span>
      </div>
    </div>
  );
}
