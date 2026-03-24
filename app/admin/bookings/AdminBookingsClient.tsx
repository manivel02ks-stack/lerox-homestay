"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  advancePaid: number | null;
  status: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: Date;
  room: { name: string };
  user: { name: string | null; email: string | null };
}

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const statusConfig: Record<string, { label: string; variant: any }> = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

export function AdminBookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      toast({ title: "Booking status updated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  }

  async function deleteBooking(id: string) {
    if (!window.confirm("Are you sure you want to permanently delete this booking? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Booking deleted" });
    } catch {
      toast({ title: "Failed to delete booking", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        b.room.name.toLowerCase().includes(s) ||
        (b.guestName || b.user.name || "").toLowerCase().includes(s) ||
        (b.user.email || "").toLowerCase().includes(s) ||
        b.id.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <>
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATUS_OPTIONS.filter((s) => s !== "ALL").map((status) => (
          <Card
            key={status}
            className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter(status === statusFilter ? "ALL" : status)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === status).length}
              </p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{status.toLowerCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by guest, room, or booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "ALL" ? "All Statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Advance Paid</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((booking) => {
                    const config = statusConfig[booking.status] || statusConfig.PENDING;
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-500">
                            #{booking.id.slice(-8).toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {booking.guestName || booking.user.name || "Guest"}
                            </p>
                            <p className="text-xs text-gray-400">{booking.user.email}</p>
                            {booking.guestPhone && (
                              <p className="text-xs text-gray-400">{booking.guestPhone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{booking.room.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">
                            {formatPrice(booking.totalPrice)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {booking.advancePaid != null ? (
                            <span className="text-sm text-green-700 font-medium">
                              {formatPrice(booking.advancePaid)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.advancePaid != null ? (
                            <span className={`text-sm font-semibold ${booking.status === "COMPLETED" ? "text-gray-400 line-through" : "text-orange-600"}`}>
                              {formatPrice(booking.totalPrice - booking.advancePaid)}
                            </span>
                          ) : booking.status === "CONFIRMED" ? (
                            <span className="text-sm font-semibold text-orange-600">
                              {formatPrice(booking.totalPrice)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={booking.status}
                              onValueChange={(val) => updateStatus(booking.id, val)}
                              disabled={updating === booking.id || deleting === booking.id}
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBooking(booking.id)}
                              disabled={deleting === booking.id || updating === booking.id}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
