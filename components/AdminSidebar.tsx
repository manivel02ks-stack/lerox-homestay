"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeRoxLogo } from "@/components/LeRoxLogo";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BedDouble,
  CalendarX,
  BookOpen,
  LogOut,
  Hotel,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Rooms",
    href: "/admin/rooms",
    icon: BedDouble,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: BookOpen,
  },
  {
    title: "Blocked Dates",
    href: "/admin/blocked-dates",
    icon: CalendarX,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex flex-col items-center px-6 py-5 border-b border-gray-700">
        <LeRoxLogo size="md" textColor="text-white" />
        <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-gray-700" />

      {/* Footer */}
      <div className="px-3 py-4">
        <Link href="/" className="block mb-2">
          <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <Hotel className="h-5 w-5" />
            <span>View Website</span>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
