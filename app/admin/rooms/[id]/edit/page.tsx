"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const AMENITY_OPTIONS = [
  "WiFi", "Air Conditioning", "TV", "Mini Bar", "Room Service",
  "Balcony", "Ocean View", "Jacuzzi", "Kitchenette", "Safe",
  "Breakfast Included", "Parking", "Gym Access", "Pool Access", "Spa Access",
];

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    maxGuests: "2",
    images: [] as string[],
    amenities: [] as string[],
    isActive: true,
  });
  const [customAmenity, setCustomAmenity] = useState("");

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  async function fetchRoom() {
    try {
      const res = await fetch(`/api/rooms/${params.id}`);
      const data = await res.json();
      const room = data.room;
      setForm({
        name: room.name,
        description: room.description,
        price: String(room.price),
        maxGuests: String(room.maxGuests),
        images: room.images,
        amenities: room.amenities,
        isActive: room.isActive,
      });
    } catch {
      toast({ title: "Failed to load room", variant: "destructive" });
      router.push("/admin/rooms");
    } finally {
      setFetching(false);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      } catch {
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      }
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !form.amenities.includes(customAmenity.trim())) {
      setForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()],
      }));
      setCustomAmenity("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          maxGuests: Number(form.maxGuests),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update room");
      }

      toast({ title: "Room updated successfully!" });
      router.push("/admin/rooms");
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Room</h1>
          <p className="text-gray-500 text-sm">Update room details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Room Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price per Night (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxGuests">Maximum Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  max="20"
                  value={form.maxGuests}
                  onChange={(e) => setForm((p) => ({ ...p, maxGuests: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-1.5 resize-none"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Room Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <div className="relative h-24 rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`Room image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("imageUpload")?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" />Upload More Images</>
                )}
              </Button>
            </div>

            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Or add image URL..."
                id="imageUrl"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.getElementById("imageUrl") as HTMLInputElement;
                  if (input.value) {
                    setForm((prev) => ({ ...prev, images: [...prev.images, input.value] }));
                    input.value = "";
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {AMENITY_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    form.amenities.includes(amenity)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Add custom amenity..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {form.amenities.filter((a) => !AMENITY_OPTIONS.includes(a)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.amenities.filter((a) => !AMENITY_OPTIONS.includes(a)).map((a) => (
                  <Badge key={a} variant="secondary" className="pr-1">
                    {a}
                    <button type="button" onClick={() => toggleAmenity(a)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/rooms")} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
