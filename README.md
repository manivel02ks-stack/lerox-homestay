# The Grand Stay - Hotel Booking Application

A full-stack, production-ready hotel booking web application built with Next.js 14, Tailwind CSS, ShadCN UI, PostgreSQL, Prisma, NextAuth.js, and Razorpay.

## Features

### Customer Features
- Browse rooms with images, pricing, and descriptions
- Availability calendar showing booked and blocked dates
- Book rooms with check-in/check-out date selection
- Double-booking prevention
- Razorpay payment integration (test mode)
- Booking confirmation page with receipt
- Mobile responsive UI

### Admin Features
- Admin login with credentials
- Add, edit, and delete rooms
- Upload room images (local storage)
- Block specific dates per room
- View and manage all bookings
- Dashboard with stats (revenue, occupancy, recent bookings)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Email magic link + Admin credentials)
- **Payments**: Razorpay
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
cd guesthouse-booking
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/guesthouse_db"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@thegrandstay.com"
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="your-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxx"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

- URL: http://localhost:3000/admin
- Email: `admin@guesthouse.com`
- Password: `admin123`

> Change these credentials in your `.env` file via `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Project Structure

```
guesthouse-booking/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel pages
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── booking/            # Booking flow pages
│   ├── rooms/              # Room listing and detail
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── AdminSidebar.tsx
│   ├── BookingCalendar.tsx
│   ├── Navbar.tsx
│   ├── RoomCard.tsx
│   └── providers.tsx
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── razorpay.ts         # Razorpay setup
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── public/
│   └── uploads/            # Uploaded room images
├── types/
│   └── next-auth.d.ts      # Type extensions
└── middleware.ts           # Route protection
```

## Deployment on Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Use Vercel Postgres or any PostgreSQL provider (Supabase, Railway, Neon)
5. Set `NEXTAUTH_URL` to your Vercel domain
6. Deploy!

### Recommended Database Providers
- [Neon](https://neon.tech) - Serverless PostgreSQL (free tier)
- [Supabase](https://supabase.com) - Full Postgres platform (free tier)
- [Railway](https://railway.app) - Simple deployments (free tier)

## Razorpay Integration

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get test API keys from Dashboard → Settings → API Keys
3. Add to `.env` file
4. Use test card: `4111 1111 1111 1111` with any future expiry and CVV

## Email Setup (Gmail)

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an app password for "Mail"
4. Use that password in `EMAIL_SERVER_PASSWORD`

## License

MIT
