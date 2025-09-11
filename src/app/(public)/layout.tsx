"use client";
import { SiteHeader } from "@/components/NavBar/site-header";
import { MobileBottomNav } from "@/components/NavBar/mobile-bottom-nav";
import { Home as HomeIcon, Info, LogIn, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase.config";
import { usePathname, useRouter } from "next/navigation";

// Define mobile icon map
const mobileIconMap = {
  home: HomeIcon,
  login: LogIn,
  info: Info,
  dashboard: LayoutDashboard,
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const authenticated = !!user;
      setIsAuthenticated(authenticated);
      setLoading(false);

      // If user is authenticated and trying to access the home page or login page,
      // redirect them to dashboard
      if (authenticated && (pathname === "/" || pathname === "/login")) {
        router.push("/org-dashboard");
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [pathname, router]);

  // Dynamic navigation links based on authentication status
  const navLinks = [
    {
      label: "Home",
      icon: "home",
      href: isAuthenticated ? "/org-dashboard" : "/",
    },
    {
      label: "About",
      icon: "info",
      href: "/about",
    },
    // Change login to dashboard when user is authenticated
    {
      label: isAuthenticated ? "Dashboard" : "Login",
      icon: isAuthenticated ? "dashboard" : "login",
      href: isAuthenticated ? "/org-dashboard" : "/login",
    },
  ];

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <SiteHeader user={null} isAuthenticated={isAuthenticated} />
        <main className="flex-1 p-4 pb-16 md:pb-4">{!loading && children}</main>
        <MobileBottomNav links={navLinks} iconMap={mobileIconMap} />
      </div>
    </div>
  );
}
