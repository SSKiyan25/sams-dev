"use client";
// import { AppSidebar } from "@/components/NavBar/app-sidebar";
import { SiteHeader } from "@/components/NavBar/site-header";
import { MobileBottomNav } from "@/components/NavBar/mobile-bottom-nav";
import { Home as HomeIcon, Info, LogIn } from "lucide-react";

// Guest navigation
const guestData = {
  user: null,
  mobileNavLinks: [
    {
      label: "Home",
      icon: "home",
      href: "/",
    },
    {
      label: "About",
      icon: "info",
      href: "/about",
    },
    {
      label: "Login",
      icon: "login",
      href: "/login",
    },
  ],
};

// Define mobile icon map
const mobileIconMap = {
  home: HomeIcon,
  login: LogIn,
  info: Info,
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <SiteHeader user={null} isAuthenticated={false} />
        <main className="flex-1 p-4 pb-16 md:pb-4">{children}</main>
        <MobileBottomNav
          links={guestData.mobileNavLinks}
          iconMap={mobileIconMap}
        />
      </div>
    </div>
  );
}
