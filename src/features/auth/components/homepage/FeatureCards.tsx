import Image from "next/image";

interface FeatureCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  animationClass: string;
}

function FeatureCard({ icon, iconAlt, title, description, animationClass }: FeatureCardProps) {
  return (
    <div className={`bg-white dark:bg-card border border-black/30 dark:border-border rounded-[22px] p-8 backdrop-blur-sm shadow-sm dark:shadow-lg h-[200px] flex items-center ${animationClass}`}>
      <div className="flex items-center gap-6 w-full">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center">
            <Image
              src={icon}
              alt={iconAlt}
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-instrument text-lg sm:text-xl font-bold text-[#272727] dark:text-foreground leading-tight mb-3">
            {title}
          </h3>
          <p className="font-instrument text-base sm:text-lg text-[#5B5B5B] dark:text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: "/calendar.svg",
      iconAlt: "Calendar icon",
      title: "Event Attendance Tracking",
      description: "Record attendance at meetings, seminars, and special events.",
      animationClass: "animate-fade-in-left animation-delay-1200"
    },
    {
      icon: "/analytics.svg",
      iconAlt: "Analytics icon",
      title: "Simple Attendance Analytics",
      description: "Instantly see how many members attended each event and track participation trends at a glance.",
      animationClass: "animate-fade-in-right animation-delay-1400"
    }
  ];

  return (
    <div className="bg-white dark:bg-background px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up animation-delay-1000">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              iconAlt={feature.iconAlt}
              title={feature.title}
              description={feature.description}
              animationClass={feature.animationClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
