"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Loader2, Eye, EyeOff, KeyRound, ArrowRight } from "lucide-react";
import { LeRoxLogo } from "@/components/LeRoxLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Guest flow state
  const [email, setEmail]           = useState("");
  const [guestStep, setGuestStep]   = useState<"email" | "password" | "otp">("email");
  const [checking, setChecking]     = useState(false);
  // password login
  const [guestPassword, setGuestPassword] = useState("");
  const [showGuestPw, setShowGuestPw]     = useState(false);
  const [guestLoading, setGuestLoading]   = useState(false);
  // OTP login
  const [otp, setOtp]               = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Admin credentials flow
  const [adminEmail, setAdminEmail]       = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [adminLoading, setAdminLoading]   = useState(false);

  // Step 1 — check if email has a password already
  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast({ title: "Please enter your email", variant: "destructive" }); return; }
    setChecking(true);
    try {
      const res  = await fetch(`/api/auth/check-user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.hasPassword) {
        setGuestStep("password");
      } else {
        // New user or hasn't set password yet → OTP flow
        await sendOtp();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  // Send OTP helper
  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setGuestStep("otp");
      toast({ title: "OTP sent!", description: "Check your email for the 6-digit code." });
    } catch {
      toast({ title: "Failed to send OTP. Please try again.", variant: "destructive" });
    } finally {
      setSendingOtp(false);
    }
  };

  // Guest password login
  const handleGuestPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPassword) { toast({ title: "Please enter your password", variant: "destructive" }); return; }
    setGuestLoading(true);
    try {
      const result = await signIn("guest-password", {
        email,
        password: guestPassword,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        toast({ title: "Incorrect password", description: "Try again or use OTP to sign in.", variant: "destructive" });
      } else {
        toast({ title: "Welcome back!" });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setGuestLoading(false);
    }
  };

  // OTP verify → after success redirect to set-password if first time
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({ title: "Enter the 6-digit OTP", variant: "destructive" });
      return;
    }
    setVerifyingOtp(true);
    try {
      const result = await signIn("otp", { email, otp, redirect: false, callbackUrl });
      if (result?.error) {
        toast({ title: "Invalid or expired OTP. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Signed in successfully!" });
        // Check if they have a password set; if not, prompt them to set one
        const check = await fetch(`/api/auth/check-user?email=${encodeURIComponent(email)}`);
        const data  = await check.json();
        if (!data.hasPassword) {
          router.push(`/auth/set-password?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast({ title: "Please enter admin credentials", variant: "destructive" });
      return;
    }
    setAdminLoading(true);
    try {
      const result = await signIn("credentials", {
        email: adminEmail,
        password: adminPassword,
        redirect: false,
        callbackUrl: "/admin",
      });
      if (result?.error) {
        toast({ title: "Invalid credentials", variant: "destructive" });
      } else if (result?.ok) {
        toast({ title: "Welcome back, Admin!" });
        router.push("/admin");
        router.refresh();
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <Tabs defaultValue="guest">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="guest">Guest Login</TabsTrigger>
        <TabsTrigger value="admin">Admin Login</TabsTrigger>
      </TabsList>

      {/* ── Guest Login ── */}
      <TabsContent value="guest">
        <div className="space-y-1 mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Guest Sign In</h2>
          <p className="text-sm text-gray-500">
            {guestStep === "email"    && "Enter your email to continue"}
            {guestStep === "password" && `Welcome back! Enter your password for ${email}`}
            {guestStep === "otp"      && `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {/* Step 1 — Email */}
        {guestStep === "email" && (
          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={checking || sendingOtp}>
              {(checking || sendingOtp) ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait…</>
              ) : (
                <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        )}

        {/* Step 2a — Password (returning user) */}
        {guestStep === "password" && (
          <form onSubmit={handleGuestPasswordLogin} className="space-y-4">
            <div>
              <Label htmlFor="guestPw">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="guestPw"
                  type={showGuestPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={guestPassword}
                  onChange={(e) => setGuestPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  autoFocus
                />
                <button type="button" onClick={() => setShowGuestPw(!showGuestPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showGuestPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={guestLoading}>
              {guestLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : "Sign In"}
            </Button>
            <button type="button" onClick={() => { setGuestStep("email"); setGuestPassword(""); }}
              className="w-full text-sm text-gray-500 hover:text-blue-600 transition-colors">
              ← Use a different email
            </button>
            <button type="button" onClick={async () => { setGuestStep("otp"); await sendOtp(); }}
              className="w-full text-sm text-blue-500 hover:text-blue-700 transition-colors">
              Forgot password? Sign in with OTP instead
            </button>
          </form>
        )}

        {/* Step 2b — OTP (new user or forgot password) */}
        {guestStep === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="otp">6-Digit OTP</Label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="pl-9 text-center text-xl tracking-widest font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={verifyingOtp}>
              {verifyingOtp ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</> : "Verify & Sign In"}
            </Button>
            <button type="button" onClick={() => { setGuestStep("email"); setOtp(""); }}
              className="w-full text-sm text-gray-500 hover:text-blue-600 transition-colors">
              ← Use a different email
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-center text-gray-400">
          {guestStep === "otp" && "OTP is valid for 10 minutes · "}
          New guests will be asked to set a password after first sign-in.
        </p>
      </TabsContent>

      {/* ── Admin Login ── */}
      <TabsContent value="admin">
        <div className="space-y-2 mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Admin Sign In</h2>
          <p className="text-sm text-gray-500">Access the admin dashboard</p>
        </div>
        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div>
            <Label htmlFor="adminEmail">Admin Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@guesthouse.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="adminPassword">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="pl-9 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={adminLoading}>
            {adminLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
            ) : "Sign In as Admin"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <LeRoxLogo size="lg" />
          </Link>
          <p className="mt-3 text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
