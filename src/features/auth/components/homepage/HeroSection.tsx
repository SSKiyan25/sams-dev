import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
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
  );
}
