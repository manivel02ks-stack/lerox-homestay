"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeRoxLogo } from "@/components/LeRoxLogo";
import { Card, CardContent } from "@/components/ui/card";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center mb-8">
          <LeRoxLogo size="lg" />
        </Link>
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <p className="text-gray-600 mb-6">Please sign in to continue.</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
