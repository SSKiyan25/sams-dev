"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Define the User interface
interface User {
  name?: string;
  email?: string;
  avatar?: string;
  image?: string;
}

// Define the props interface
interface SiteHeaderProps {
  user?: User | null;
  isAuthenticated: boolean;
}

export function SiteHeader({ user, isAuthenticated }: SiteHeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use avatar from user.avatar or user.image (fallback) if user exists
  const avatarSrc = user?.avatar || user?.image;
  const isLoginPage = pathname === "/login";

  // Ensure component is mounted before showing theme-dependent content
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full h-[74px] bg-white dark:bg-background border-b border-gray-400 dark:border-border shadow-lg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo image: hidden only on login page */}
          <Image
            src="/enhanced-logo-final.svg"
            alt="Coral Logo"
            width={45}
            height={45}
            className={`text-primary ${isLoginPage ? "hidden" : ""}`}
          />
          <Link href={isAuthenticated ? "/org-dashboard" : "/"}>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground dark:text-foreground ml-3">
              CORAL
            </h1>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Home Link - Only show if user is NOT authenticated */}
            {/* {!isAuthenticated && (
              <Link
                href="/"
                className={`font-instrument text-lg sm:text-xl text-[#202020] dark:text-foreground hover:text-[#008ACF] dark:hover:text-primary transition-colors ${
                  pathname === "/" ? "font-medium" : ""
                }`}
              >
                Home
              </Link>
            )} */}
            {/* Dashboard Link - Only show if user IS authenticated
            {isAuthenticated && (
              <Link
                href="/org-dashboard"
                className={`font-instrument text-lg sm:text-xl text-[#202020] dark:text-foreground hover:text-[#008ACF] dark:hover:text-primary transition-colors ${
                  pathname.includes("/org-dashboard") ? "font-medium" : ""
                }`}
              >
                Dashboard
              </Link>
            )} */}
            {isAuthenticated && user ? (
              // Show user avatar when authenticated
              <Avatar className="h-9 w-9 rounded-lg ring-1 ring-primary/20">
                <AvatarImage src={avatarSrc} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-primary-foreground text-primary">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              // Show login link with consistent styling
              <Link
                href="/login"
                className={`font-instrument text-lg sm:text-xl text-[#202020] dark:text-foreground hover:text-[#008ACF] dark:hover:text-primary transition-colors ${
                  pathname === "/login" ? "font-medium" : ""
                }`}
              >
                Login
              </Link>
            )}
            {/* Custom Mode Toggle with consistent styling */}
            <button
              onClick={toggleTheme}
              className="font-instrument text-lg sm:text-xl text-[#202020] dark:text-foreground hover:text-[#008ACF] dark:hover:text-primary transition-colors flex items-center gap-1"
            >
              {mounted ? (
                <>
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {theme === "dark" ? "Light" : "Dark"}
                </>
              ) : (
                // Show a neutral state during SSR/before hydration
                <>
                  <Moon className="h-4 w-4" />
                  Theme
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
