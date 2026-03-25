"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  price: number;
  images: string[];
  amenities: string[];
  maxGuests: number;
  isActive: boolean;
  _count?: { bookings: number };
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms?includeInactive=true");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch {
      toast({ title: "Failed to load rooms", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function toggleRoomStatus(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !isActive } : r))
      );
      toast({
        title: `Room ${!isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch {
      toast({ title: "Failed to update room status", variant: "destructive" });
    }
  }

  async function deleteRoom(id: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Room deleted successfully" });
      setDeleteId(null);
    } catch {
      toast({ title: "Failed to delete room", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your hotel rooms and suites
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/admin/rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Link>
        </Button>
      </div>

      {/* Rooms Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>All Rooms ({rooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-4">No rooms added yet</p>
              <Button asChild>
                <Link href="/admin/rooms/new">Add Your First Room</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Max Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              room.images[0] ||
                              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100"
                            }
                            alt={room.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{room.name}</p>
                          <p className="text-xs text-gray-400">
                            {room.amenities.slice(0, 2).join(", ")}
                            {room.amenities.length > 2 && "..."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {formatPrice(room.price)}
                      </span>
                    </TableCell>
                    <TableCell>{room.maxGuests} guests</TableCell>
                    <TableCell>
                      <Badge variant={room.isActive ? "success" : "secondary"}>
                        {room.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleRoomStatus(room.id, room.isActive)
                          }
                          title={room.isActive ? "Deactivate" : "Activate"}
                        >
                          {room.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" asChild title="Reviews">
                          <Link href={`/admin/rooms/${room.id}/reviews`}>
                            <MessageSquare className="h-4 w-4 text-purple-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/rooms/${room.id}/edit`}>
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(room.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={() => !deleteLoading && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be
              undone and will also delete all associated bookings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteRoom(deleteId)}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
