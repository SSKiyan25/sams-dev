"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Image */}
          <div className="flex justify-center animate-fade-in-up animation-delay-900">
            <Image
              src="/images/students-vector.jpg"
              alt="Students collaborating and studying together"
              width={2470}
              height={800}
              className="w-full max-w-6xl h-auto object-contain"
            />
          </div>

          {/* Main Title */}
          <div className="text-center mt-2 mb-5 animate-fade-in-up animation-delay-900">
            <h1 className="font-instrument text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight">
              CORAL for Student Organizations
            </h1>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-8 animate-fade-in-up animation-delay-600">
            <p className="font-instrument text-lg sm:text-xl lg:text-2xl text-[#5B5B5B] leading-relaxed max-w-4xl mx-auto">
              Centralized Online Record for Attendance and Logging
            </p>
          </div>

          {/* Login Button */}
          <div className="flex justify-center mb-13 animate-fade-in-up animation-delay-800">
            <Button
              asChild
              className="bg-[#008ACF] hover:bg-[#0f73a5] text-white font-poppins text-lg sm:text-2lg font-medium px-16 sm:px-24 py-4 sm:py-8 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up animation-delay-1000">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Event Attendance Tracking Card */}
            <div className="bg-white border border-black/30 rounded-[22px] p-8 backdrop-blur-sm shadow-sm h-[200px] flex items-center animate-fade-in-left animation-delay-1200">
              <div className="flex items-center gap-6 w-full">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/calendar.svg"
                      alt="Calendar icon"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument text-lg sm:text-xl font-bold text-[#272727] leading-tight mb-3">
                    Event Attendance Tracking
                  </h3>
                  <p className="font-instrument text-base sm:text-lg text-[#5B5B5B] leading-relaxed">
                    Record attendance at meetings, seminars, and special events.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/30 rounded-[22px] p-8 backdrop-blur-sm shadow-sm h-[200px] flex items-center animate-fade-in-right animation-delay-1400">
              <div className="flex items-center gap-6 w-full">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/analytics.svg"
                      alt="Analytics icon"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument text-lg sm:text-xl font-bold text-[#272727] leading-tight mb-3">
                    Simple Attendance Analytics
                  </h3>
                  <p className="font-instrument text-base sm:text-lg text-[#5B5B5B] leading-relaxed">
                    Instantly see how many members attended each event and track
                    participation trends at a glance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-16 mt-5 mb-30 animate-fade-in-up animation-delay-1600">
        {/* Section Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 pointer-events-none -z-10"
          style={{ backgroundImage: "url(/images/dcst-building.jpg)" }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-50/40"></div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="font-instrument text-2xl sm:text-3xl lg:text-4xl font-bold text-[#262626] leading-tight mb-6 animate-fade-in-up animation-delay-1800">
            Ready to boost your student operations?
          </h2>
          <p className="font-instrument text-lg sm:text-xl lg:text-2xl text-black leading-relaxed mb-12 max-w-4xl mx-auto animate-fade-in-up animation-delay-2000">
            Join other VSU student organizations using SAMS to streamline their
            events and track member participation.
          </p>
          <div className="animate-fade-in-up animation-delay-2200">
            <Button
              asChild
              className="bg-[#FF7146] hover:bg-orange-600 text-white font-poppins text-lg font-sm px-16 sm:px-24 py-4 sm:py-8 rounded-2xl transition-colors duration-200"
            >
              <Link href="#">CONTACT US</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
