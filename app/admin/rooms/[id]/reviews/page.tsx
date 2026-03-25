"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star, Eye, EyeOff, Trash2, ArrowLeft, MessageSquare,
  Reply, CheckCircle2, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  adminReply: string | null;
  adminRepliedAt: string | null;
  createdAt: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-4 w-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

function ReplyBox({
  review,
  onSaved,
}: {
  review: Review;
  onSaved: (id: string, reply: string | null) => void;
}) {
  const [open, setOpen]       = useState(false);
  const [text, setText]       = useState(review.adminReply ?? "");
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  // sync if parent updates
  useEffect(() => { setText(review.adminReply ?? ""); }, [review.adminReply]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: text }),
      });
      if (!res.ok) throw new Error("Failed");
      onSaved(review.id, text.trim() || null);
      setOpen(false);
      toast({ title: "Reply saved" });
    } catch {
      toast({ title: "Failed to save reply", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function removeReply() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: "" }),
      });
      if (!res.ok) throw new Error("Failed");
      onSaved(review.id, null);
      setText("");
      setOpen(false);
      toast({ title: "Reply removed" });
    } catch {
      toast({ title: "Failed to remove reply", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-3">
      {/* Existing reply display */}
      {review.adminReply && !open && (
        <div className="ml-4 border-l-2 border-blue-300 pl-3 py-1 bg-blue-50 rounded-r-lg">
          <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
            <Reply className="h-3 w-3" /> Le Rox Reply
            {review.adminRepliedAt && (
              <span className="font-normal text-blue-400 ml-1">
                · {format(new Date(review.adminRepliedAt), "dd MMM yyyy")}
              </span>
            )}
          </p>
          <p className="text-sm text-blue-800">{review.adminReply}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setOpen(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit reply
            </button>
            <button
              onClick={removeReply}
              disabled={deleting}
              className="text-xs text-red-500 hover:underline"
            >
              {deleting ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      )}

      {/* Reply form */}
      {open ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your reply as Le Rox Home-Stay…"
            rows={3}
            className="text-sm resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !text.trim()}
              className="bg-blue-600 hover:bg-blue-700 gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save Reply"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setText(review.adminReply ?? ""); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        !review.adminReply && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            <Reply className="h-3.5 w-3.5" /> Reply to this review
          </button>
        )
      )}
    </div>
  );
}

export default function AdminRoomReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    const [reviewsRes, roomRes] = await Promise.all([
      fetch(`/api/admin/rooms/${id}/reviews`),
      fetch(`/api/rooms/${id}`),
    ]);
    const reviewsData = await reviewsRes.json();
    const roomData    = await roomRes.json();
    setReviews(reviewsData.reviews || []);
    setRoomName(roomData.room?.name || "Room");
    setLoading(false);
  }

  async function toggleVisibility(reviewId: string, current: boolean) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !current }),
    });
    if (!res.ok) { toast({ title: "Failed to update", variant: "destructive" }); return; }
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, isVisible: !current } : r));
    toast({ title: `Review ${!current ? "shown" : "hidden"}` });
  }

  async function deleteReview(reviewId: string) {
    if (!window.confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    if (!res.ok) { toast({ title: "Failed to delete", variant: "destructive" }); return; }
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    toast({ title: "Review deleted" });
  }

  function handleReplySaved(reviewId: string, reply: string | null) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, adminReply: reply, adminRepliedAt: reply ? new Date().toISOString() : null }
          : r
      )
    );
  }

  const avg     = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const visible = reviews.filter((r) => r.isVisible).length;
  const replied = reviews.filter((r) => r.adminReply).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/rooms")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Rooms
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews — {roomName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and respond to guest feedback</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">{avg ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{reviews.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Reviews</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{visible}</p>
            <p className="text-xs text-gray-500 mt-1">Visible</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{replied}</p>
            <p className="text-xs text-gray-500 mt-1">Replied</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            All Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No reviews yet for this room</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`rounded-xl border p-4 transition-all ${
                    review.isVisible ? "bg-white border-gray-100" : "bg-gray-50 border-dashed border-gray-200 opacity-60"
                  }`}
                >
                  {/* Review header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900">{review.guestName}</span>
                        <StarDisplay rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {format(new Date(review.createdAt), "dd MMM yyyy")}
                        </span>
                        {!review.isVisible && (
                          <Badge variant="secondary" className="text-xs">Hidden</Badge>
                        )}
                        {review.adminReply && (
                          <Badge className="text-xs bg-blue-100 text-blue-700 border-0">Replied</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>

                      {/* Reply section */}
                      <ReplyBox review={review} onSaved={handleReplySaved} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm"
                        onClick={() => toggleVisibility(review.id, review.isVisible)}
                        title={review.isVisible ? "Hide" : "Show"}
                        className="h-8 w-8 p-0">
                        {review.isVisible
                          ? <Eye className="h-4 w-4 text-blue-500" />
                          : <EyeOff className="h-4 w-4 text-gray-400" />}
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={() => deleteReview(review.id)}
                        className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
