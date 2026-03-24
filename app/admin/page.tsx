import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import {
  BedDouble,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRooms,
    activeRooms,
    totalBookings,
    monthlyBookings,
    recentBookings,
    pendingBookings,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { totalPrice: true },
    }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        room: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ]);

  const monthlyRevenue = monthlyBookings.reduce(
    (sum, b) => sum + b.totalPrice,
    0
  );

  return {
    totalRooms,
    activeRooms,
    totalBookings,
    monthlyRevenue,
    recentBookings,
    pendingBookings,
  };
}

const statusConfig = {
  PENDING: { label: "Pending", variant: "warning" as const, icon: Clock },
  CONFIRMED: { label: "Confirmed", variant: "success" as const, icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
  COMPLETED: { label: "Completed", variant: "secondary" as const, icon: CheckCircle },
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here&apos;s what&apos;s happening at Le Rox Home-Stay.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Rooms",
            value: stats.totalRooms,
            description: `${stats.activeRooms} active`,
            icon: BedDouble,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Total Bookings",
            value: stats.totalBookings,
            description: `${stats.pendingBookings} pending`,
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            title: "Revenue This Month",
            value: formatPrice(stats.monthlyRevenue),
            description: "Confirmed & completed",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            title: "Occupancy Rate",
            value:
              stats.totalRooms > 0
                ? `${Math.round((stats.activeRooms / stats.totalRooms) * 100)}%`
                : "0%",
            description: "Active rooms ratio",
            icon: TrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest booking activity</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No bookings yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentBookings.map((booking) => {
                  const config = statusConfig[booking.status] || statusConfig.PENDING;
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {booking.guestName || booking.user.name || "Guest"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {booking.user.email}
                          </p>
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
                        <span className="font-medium text-sm">
                          {formatPrice(booking.totalPrice)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
