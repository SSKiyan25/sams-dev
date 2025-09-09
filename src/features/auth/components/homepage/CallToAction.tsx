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
        <h2 className="font-nunito text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#262626] dark:text-foreground leading-[1.2] lg:leading-tight mb-6 animate-fade-in-up animation-delay-1800 tracking-tight">
          Ready to boost your student operations?
        </h2>
        <p className="font-nunito-sans text-sm sm:text-base lg:text-lg xl:text-xl text-black dark:text-muted-foreground leading-relaxed mb-12 max-w-4xl mx-auto animate-fade-in-up animation-delay-2000 font-medium tracking-wide">
          Join other VSU student organizations using SAMS to streamline their
          events and track member participation.
        </p>
        <div className="animate-fade-in-up animation-delay-2200">
          <Button
            asChild
            className="bg-[#FF7146] hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-nunito-sans text-sm sm:text-base lg:text-lg font-semibold px-12 sm:px-16 lg:px-20 py-3 sm:py-4 lg:py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] tracking-wide"
          >
            <Link href="#">CONTACT US</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
