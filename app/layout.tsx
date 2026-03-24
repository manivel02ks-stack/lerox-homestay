import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { LeRoxLogo } from "@/components/LeRoxLogo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "Le Rox Home-Stay",
  description:
    "Book your perfect stay at Le Rox Home-Stay. Luxury rooms, exceptional service, and unforgettable experiences.",
  keywords: ["hotel", "booking", "luxury", "rooms", "accommodation"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Le Rox Home-Stay",
    description: "Book your perfect stay at Le Rox Home-Stay.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${ebGaramond.variable} ${inter.className}`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-900 text-white mt-16">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <LeRoxLogo size="md" textColor="text-white" className="mb-3" />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Experience luxury and comfort at Le Rox Home-Stay. We offer
                    premium rooms with world-class amenities and exceptional
                    hospitality.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">
                    Quick Links
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>
                      <a href="/" className="hover:text-white transition-colors">
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="/rooms"
                        className="hover:text-white transition-colors"
                      >
                        Rooms
                      </a>
                    </li>
                    <li>
                      <a
                        href="/auth/login"
                        className="hover:text-white transition-colors"
                      >
                        Login
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">
                    Contact
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>
                      <a href="mailto:leroxstay@gmail.com" className="hover:text-white transition-colors">
                        leroxstay@gmail.com
                      </a>
                    </li>
                    <li>
                      <a href="tel:+919342222799" className="hover:text-white transition-colors">
                        +91 93422 22799
                      </a>
                    </li>
                    <li className="leading-relaxed">
                      66, 7th Cross Rd, Nainar Mandapam,<br />
                      Velrampet, Puducherry – 605004
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                <p>
                  &copy; {new Date().getFullYear()} Le Rox Home-Stay. All rights
                  reserved.
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
