"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface BookingCalendarProps {
  roomId: string;
  onDateSelect: (range: DateRange | undefined) => void;
  selectedRange?: DateRange;
}

export function BookingCalendar({
  roomId,
  onDateSelect,
  selectedRange,
}: BookingCalendarProps) {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookedDates() {
      try {
        const res = await fetch(
          `/api/rooms/${roomId}/availability?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`
        );
        const data = await res.json();
        if (data.bookedDates) {
          setBookedDates(data.bookedDates.map((d: string) => new Date(d)));
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookedDates();
  }, [roomId]);

  const today = new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="booking-calendar">
      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #2563eb;
          --rdp-background-color: #eff6ff;
          margin: 0;
        }
        .rdp-day_selected:not([disabled]) {
          background-color: #2563eb !important;
          color: white !important;
        }
        .rdp-day_range_middle:not([disabled]) {
          background-color: #eff6ff !important;
          color: #1e40af !important;
        }
        .rdp-day_range_start, .rdp-day_range_end {
          background-color: #2563eb !important;
          color: white !important;
        }
        .booked-day {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
          text-decoration: line-through;
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={onDateSelect}
        numberOfMonths={1}
        fromDate={today}
        toDate={addDays(today, 365)}
        disabled={[
          { before: today },
          ...bookedDates.map((d) => d),
        ]}
        modifiers={{
          booked: bookedDates,
        }}
        modifiersClassNames={{
          booked: "booked-day",
        }}
        footer={
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-red-200" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-600" />
              <span>Selected</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
