"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getInitials } from "@/lib/utils";
import { LeRoxLogo } from "@/components/LeRoxLogo";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rooms", label: "Rooms" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    /* Outer wrapper — full-width sticky strip, transparent */
    <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-10 py-3 pointer-events-none">
      {/* Floating pill navbar */}
      <nav className="pointer-events-auto mx-auto max-w-5xl rounded-full border border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
        style={{ WebkitBackdropFilter: "blur(24px)" }}
      >
        <div className="flex h-16 items-center justify-between px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <LeRoxLogo size="md" />
          </Link>

          {/* Desktop Nav Links — centred */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-black/8 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right — auth + theme */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {getInitials(session.user?.name || session.user?.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col gap-0.5 p-2">
                    {session.user?.name && (
                      <p className="font-medium text-sm">{session.user.name}</p>
                    )}
                    {session.user?.email && (
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {(session.user as any)?.role === "ADMIN" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings" className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onSelect={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-black/8 dark:hover:bg-white/10"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 font-semibold text-sm shadow-sm"
                >
                  <Link href="/rooms">Book Now</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile — theme + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <Link href="/" className="flex items-center mb-4" onClick={() => setIsOpen(false)}>
                    <LeRoxLogo size="md" />
                  </Link>

                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-base font-medium text-gray-700 hover:text-blue-600 py-2 border-b border-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {session ? (
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center space-x-3 pb-3 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getInitials(session.user?.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{session.user?.name}</p>
                          <p className="text-sm text-gray-500">{session.user?.email}</p>
                        </div>
                      </div>
                      {(session.user as any)?.role === "ADMIN" ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2 py-2 text-sm"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          href="/my-bookings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2 py-2 text-sm"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>My Bookings</span>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200"
                        onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/" }); }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/rooms" onClick={() => setIsOpen(false)}>Book Now</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </nav>
    </div>
  );
}
