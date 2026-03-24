import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Contact Us - Le Rox Home-Stay",
  description: "Get in touch with Le Rox Home-Stay, Pondicherry.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            We&apos;re here to help. Reach out for bookings, enquiries, or any
            assistance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Cards */}
          <div className="space-y-5">
            {/* Phone */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 shrink-0">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Phone / WhatsApp</p>
                  <a
                    href="tel:+919342222799"
                    className="text-blue-600 hover:underline text-lg font-medium"
                  >
                    +91 93422 22799
                  </a>
                  <p className="text-sm text-gray-400 mt-1">
                    Call or WhatsApp for direct enquiry
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 shrink-0">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email</p>
                  <a
                    href="mailto:leroxstay@gmail.com"
                    className="text-green-600 hover:underline text-lg font-medium"
                  >
                    leroxstay@gmail.com
                  </a>
                  <p className="text-sm text-gray-400 mt-1">
                    We&apos;ll respond within a few hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shrink-0">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Address</p>
                  <p className="text-gray-700 leading-relaxed">
                    66, 7th Cross Rd, Nainar Mandapam,<br />
                    Velrampet, Puducherry – 605004
                  </p>
                  <a
                    href="https://maps.app.goo.gl/gVAeqjzDrdkxKDtc7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-orange-600 hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shrink-0">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Available</p>
                  <p className="text-gray-700">24 Hours / 7 Days</p>
                  <p className="text-sm text-gray-400 mt-1">
                    We&apos;re always here to assist you
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Embed */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 min-h-[420px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.1!2d79.8317!3d11.9416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361e9e3b4c0a1%3A0x1!2s66%2C+7th+Cross+Rd%2C+Nainar+Mandapam%2C+Velrampet%2C+Puducherry%2C+605004!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "420px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
