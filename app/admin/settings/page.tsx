"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, KeyRound, Trash2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [creating, setCreating] = useState(false);

  // Reset form
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdmins(data.admins);
    } catch {
      toast({ title: "Failed to load admin users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createEmail || !createPassword) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", email: createEmail, name: createName, password: createPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to create admin", variant: "destructive" });
      } else {
        toast({ title: "Admin account created successfully" });
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        fetchAdmins();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail || !resetPassword) {
      toast({ title: "Email and new password are required", variant: "destructive" });
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email: resetEmail, password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to reset password", variant: "destructive" });
      } else {
        toast({ title: "Password reset successfully" });
        setResetEmail("");
        setResetPassword("");
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete(email: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error || "Failed to delete admin", variant: "destructive" });
      } else {
        toast({ title: "Admin account deleted" });
        fetchAdmins();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage admin accounts and passwords</p>
      </div>

      {/* Current Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-blue-600" />
            Admin Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No admin accounts found.</p>
          ) : (
            <div className="divide-y">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{admin.name || "—"}</p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Added {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {admin.email !== (session?.user as any)?.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm(`Delete admin account "${admin.email}"? This cannot be undone.`)) {
                          handleDelete(admin.email!);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {admin.email === (session?.user as any)?.email && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5 text-green-600" />
              Create New Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="createName">Full Name (optional)</Label>
                <Input
                  id="createName"
                  placeholder="John Doe"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="createEmail">Email Address</Label>
                <Input
                  id="createEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="createPassword">Password</Label>
                <Input
                  id="createPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={creating}>
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" />Create Admin Account</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reset Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-5 w-5 text-orange-600" />
              Reset Admin Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label htmlFor="resetEmail">Admin Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="resetPassword">New Password</Label>
                <Input
                  id="resetPassword"
                  type="password"
                  placeholder="New password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <p className="text-xs text-gray-400">
                This will immediately update the password for the specified admin account.
              </p>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={resetting}>
                {resetting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</>
                ) : (
                  <><KeyRound className="mr-2 h-4 w-4" />Reset Password</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
