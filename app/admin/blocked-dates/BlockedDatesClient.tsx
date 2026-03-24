"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarX, Unlock, Loader2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface Room {
  id: string;
  name: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string | null;
  room: { name: string };
}

interface BookedDate {
  roomId: string;
  roomName: string;
  date: string;
  bookingId: string;
  guestName: string | null;
}

interface Props {
  initialRooms: Room[];
  initialBlockedDates: BlockedDate[];
  initialBookedDates: BookedDate[];
}

export default function BlockedDatesClient({ initialRooms, initialBlockedDates, initialBookedDates }: Props) {
  const [rooms] = useState<Room[]>(initialRooms);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const bookedDates = initialBookedDates;
  const [selectedRoom, setSelectedRoom] = useState<string>(initialRooms[0]?.id || "");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchBlockedDates() {
    try {
      const res = await fetch("/api/blocked-dates");
      const data = await res.json();
      setBlockedDates(data.blockedDates || []);
    } catch {
      toast({ title: "Failed to refresh blocked dates", variant: "destructive" });
    }
  }

  const roomBlockedDates = blockedDates
    .filter((bd) => {
      if (!selectedRoom) return false;
      const room = rooms.find((r) => r.id === selectedRoom);
      return room && bd.room.name === room.name;
    })
    .map((bd) => new Date(bd.date));

  const roomBookedDates = bookedDates
    .filter((bd) => bd.roomId === selectedRoom)
    .map((bd) => new Date(bd.date));

  async function handleBlockDates() {
    if (!selectedRoom || selectedDates.length === 0) {
      toast({ title: "Please select a room and at least one date", variant: "destructive" });
      return;
    }

    setSaving(true);
    let successCount = 0;
    for (const date of selectedDates) {
      try {
        const res = await fetch("/api/blocked-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: selectedRoom,
            date: date.toISOString(),
            reason,
          }),
        });
        if (res.ok) successCount++;
      } catch {
        // skip
      }
    }

    if (successCount > 0) {
      toast({ title: `${successCount} date(s) blocked successfully` });
      setSelectedDates([]);
      setReason("");
      fetchBlockedDates();
    } else {
      toast({ title: "Failed to block dates", variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleUnblock(id: string) {
    try {
      const res = await fetch(`/api/blocked-dates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setBlockedDates((prev) => prev.filter((bd) => bd.id !== id));
      toast({ title: "Date unblocked successfully" });
    } catch {
      toast({ title: "Failed to unblock date", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blocked Dates</h1>
        <p className="text-gray-500 text-sm mt-1">
          Block specific dates to prevent bookings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Block */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Block Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Room Select */}
            <div>
              <Label>Select Room</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar */}
            <div className="border rounded-xl overflow-hidden">
              <style>{`
                .rdp { margin: 0; }
                .blocked-day { background-color: #fee2e2 !important; color: #dc2626 !important; font-weight: 600; }
                .booked-day { background-color: #dbeafe !important; color: #1d4ed8 !important; font-weight: 600; }
                .rdp-day_selected:not(.booked-day):not(.blocked-day) { background-color: #16a34a !important; color: white !important; }
              `}</style>
              <DayPicker
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                fromDate={new Date()}
                modifiers={{ blocked: roomBlockedDates, booked: roomBookedDates }}
                modifiersClassNames={{ blocked: "blocked-day", booked: "booked-day" }}
                className="p-3"
                footer={
                  <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-200" />
                      Manually blocked
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-200" />
                      Confirmed booking
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
                      Selected
                    </div>
                  </div>
                }
              />
            </div>

            {selectedDates.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                {selectedDates.length} date(s) selected to block
              </div>
            )}

            {/* Reason */}
            <div>
              <Label>Reason (Optional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Maintenance, Private event"
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={handleBlockDates}
              disabled={saving || !selectedRoom || selectedDates.length === 0}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Blocking...</>
              ) : (
                <><CalendarX className="mr-2 h-4 w-4" />Block Selected Dates</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Blocked Dates List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Currently Blocked ({blockedDates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedDates.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <CalendarX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No dates blocked</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...blockedDates]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((bd) => (
                      <TableRow key={bd.id}>
                        <TableCell className="text-sm font-medium">
                          {format(new Date(bd.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {bd.room.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {bd.reason || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblock(bd.id)}
                            className="text-green-700 border-green-300 hover:bg-green-50 hover:text-green-800 hover:border-green-400 gap-1.5"
                          >
                            <Unlock className="h-3.5 w-3.5" />
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
