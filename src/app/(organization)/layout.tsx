"use client";
import { AppSidebar } from "@/components/NavBar/app-sidebar";
import { SiteHeader } from "@/components/NavBar/site-header";
import { MobileBottomNav } from "@/components/NavBar/mobile-bottom-nav";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";

// Organization user is authenticated
const isAuthenticated = true;

// Organization navigation data
const organizationData = {
  user: {
    name: "Organization Admin",
    email: "admin@example.org",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/org-dashboard",
      icon: "layout-dashboard",
    },
    {
      title: "Events",
      url: "/org-events",
      icon: "calendar",
    },
    {
      title: "Members",
      url: "/org-members",
      icon: "users",
    },
    {
      title: "Reports",
      url: "/organization/reports",
      icon: "bar-chart",
    },
    {
      title: "Settings",
      url: "/organization/settings",
      icon: "settings",
    },
  ],
  mobileNavLinks: [
    {
      label: "Dashboard",
      icon: "dashboard",
      href: "/org-dashboard",
    },
    {
      label: "Events",
      icon: "calendar",
      href: "/org-events",
    },
    {
      label: "Members",
      icon: "users",
      href: "/org-members",
    },
  ],
};

// Define icon map for the sidebar
const iconMap = {
  "layout-dashboard": LayoutDashboard,
  calendar: Calendar,
  users: Users,
  "bar-chart": BarChart,
  settings: Settings,
};

// Define mobile icon map
const mobileIconMap = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  users: Users,
  logout: LogOut,
};

export default function OrganizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        user={organizationData.user}
        navMain={organizationData.navMain}
        iconMap={iconMap}
        className="z-50"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <SiteHeader
          user={organizationData.user}
          isAuthenticated={isAuthenticated}
        />
        <main className="flex-1 p-4 pb-16 md:pb-4">{children}</main>
        <MobileBottomNav
          links={organizationData.mobileNavLinks}
          iconMap={mobileIconMap}
        />
      </div>
    </div>
  );
}
