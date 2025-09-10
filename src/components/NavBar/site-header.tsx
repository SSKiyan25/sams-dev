"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, Settings, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase.config";

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
  const router = useRouter();
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="w-full h-[74px] bg-white dark:bg-background border-b border-gray-400 dark:border-border shadow-lg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Logo and Title */}
          <div className="flex items-center">
            {!isLoginPage && (
              <Image
                src="/enhanced-logo-final.svg"
                alt="Coral Logo"
                width={45}
                height={45}
                className="text-primary"
              />
            )}
            <Link href={isAuthenticated ? "/org-dashboard" : "/"}>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground dark:text-foreground ml-3">
                CORAL
              </h1>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="font-nunito text-lg sm:text-xl text-[#202020] dark:text-foreground hover:text-[#008ACF] dark:hover:text-primary transition-colors flex items-center gap-1"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
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

            {/* User Menu or Login Link */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none focus:ring-2 focus:ring-primary/20 rounded-lg">
                    <Avatar className="h-9 w-9 rounded-lg ring-1 ring-primary/20 cursor-pointer">
                      <AvatarImage src={avatarSrc} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-primary-foreground text-primary">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/organization/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/organization/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Show login link with consistent styling
              <Link
                href="/login"
                className={`font-nunito text-lg sm:text-xl text-[#202020] dark:text-foreground hover:text-[#008ACF] dark:hover:text-primary transition-colors ${
                  pathname === "/login" ? "font-medium" : ""
                }`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
