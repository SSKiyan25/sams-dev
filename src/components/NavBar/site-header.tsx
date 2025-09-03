"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../ui/mode-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import Link from "next/link";

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
  const isMobile = useIsMobile();

  // Use avatar from user.avatar or user.image (fallback) if user exists
  const avatarSrc = user?.avatar || user?.image;

  return (
    <header className="sticky top-0 right-0 z-30 w-full bg-primary/85 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/50 bg-card/50 backdrop-blur-sm transition-all ease-linear duration-200">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 p-4">
        <SidebarTrigger className="hover:bg-primary/10 text-primary-foreground rounded-full shadow-lg" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 bg-border/50 text-primary-foreground"
        />
        {isMobile && (
          <span className="flex items-center gap-1">
            <Image
              src="/logo-white.svg"
              alt=""
              width={28}
              height={28}
              className="text-primary"
            />
            <h1 className="text-xl font-bold text-primary-foreground">CORAL</h1>
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <ModeToggle />

          {isAuthenticated && user ? (
            // Show user avatar when authenticated
            <Avatar className="h-9 w-9 rounded-lg ring-1 ring-primary/20">
              <AvatarImage src={avatarSrc} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-primary-foreground text-primary">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            // Show login button when not authenticated
            <Button asChild size="sm" variant="secondary">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
