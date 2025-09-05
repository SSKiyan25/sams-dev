import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <div className="relative px-4 sm:px-6 lg:px-8 py-16 mt-5 mb-30 animate-fade-in-up animation-delay-1600">
      {/* Section Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 pointer-events-none -z-10"
        style={{ backgroundImage: "url(/images/dcst-building.jpg)" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-50/40 dark:bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h2 className="font-instrument text-2xl sm:text-3xl lg:text-4xl font-bold text-[#262626] dark:text-foreground leading-tight mb-6 animate-fade-in-up animation-delay-1800">
          Ready to boost your student operations?
        </h2>
        <p className="font-instrument text-lg sm:text-xl lg:text-2xl text-black dark:text-muted-foreground leading-relaxed mb-12 max-w-4xl mx-auto animate-fade-in-up animation-delay-2000">
          Join other VSU student organizations using SAMS to streamline their
          events and track member participation.
        </p>
        <div className="animate-fade-in-up animation-delay-2200">
          <Button
            asChild
            className="bg-[#FF7146] hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-poppins text-lg font-sm px-16 sm:px-24 py-4 sm:py-8 rounded-2xl transition-colors duration-200"
          >
            <Link href="#">CONTACT US</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
