"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  { src: "/images/hero.jpg",            label: "Pondicherry Promenade" },
  { src: "/images/exterior/img_00.jpg", label: "Le Rox Home-Stay" },
  { src: "/images/exterior/img_01.jpg", label: "Le Rox Home-Stay" },
  { src: "/images/exterior/img_02.jpg", label: "Le Rox Home-Stay" },
  { src: "/images/suite-1/img_00.jpg", label: "Suite 1" },
  { src: "/images/suite-1/img_01.jpg", label: "Suite 1" },
  { src: "/images/suite-1/img_02.jpg", label: "Suite 1" },
  { src: "/images/suite-1/img_03.jpg", label: "Suite 1" },
  { src: "/images/suite-1/img_04.jpg", label: "Suite 1" },
  { src: "/images/suite-1/img_05.jpg", label: "Suite 1" },
  { src: "/images/suite-2/img_00.jpg", label: "Suite 2" },
  { src: "/images/suite-2/img_01.jpg", label: "Suite 2" },
  { src: "/images/suite-2/img_02.jpg", label: "Suite 2" },
  { src: "/images/suite-2/img_03.jpg", label: "Suite 2" },
  { src: "/images/suite-2/img_04.jpg", label: "Suite 2" },
  { src: "/images/suite-2/img_05.jpg", label: "Suite 2" },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section
      className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/55 to-slate-800/35" />
        </div>
      ))}

      {/* Left Arrow */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/25 text-white p-2.5 rounded-full transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/25 text-white p-2.5 rounded-full transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 flex-wrap justify-center max-w-xs">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/45 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide Label */}
      <div className="absolute bottom-14 right-6 z-20">
        <span className="text-xs text-white/70 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
          {SLIDES[current].label} • {current + 1} / {SLIDES.length}
        </span>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span>Rated 4.9/5 by 100+ guests</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Your Perfect Home-Stay Awaits at{" "}
          <span className="text-blue-900">
            LeRox
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
          Discover unparalleled luxury and comfort at Le Rox Home-Stay. Book
          your dream room today and experience hospitality at its finest.
        </p>

        {/* Search Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                className="w-full bg-white text-gray-900 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"
            >
              <Link href="/rooms">Browse Rooms</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Instant Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Best Price Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
