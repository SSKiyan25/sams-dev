"use client";

import { MoreVertical, LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase.config";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { clearAllCachesOnLogout } from "@/features/organization/members/services/membersCache";
// import { useRouter } from "next/navigation";

interface User {
  name?: string;
  email?: string;
  avatar?: string;
  image?: string;
}

interface NavUserProps {
  user: User;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const [isSigningOut, setIsSigningOut] = useState(false);
  // const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      clearAllCachesOnLogout();

      // First, sign out from Firebase
      await signOut(auth);

      // Then clear the session cookie
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      // Use a reload approach instead of redirect
      window.location.href = "/?logout=true";
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  // Use avatar from user.avatar or user.image (fallback)
  const avatarSrc = user.avatar || user.image;

  return (
    <SidebarMenu>
      {isSigningOut && <LoadingScreen message="Signing out..." />}
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary/10 transition-all data-[state=open]:bg-primary/20 data-[state=open]:text-primary"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-primary/20">
                <AvatarImage src={avatarSrc} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-primary/20 text-primary">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-muted-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground/70">
                  {user.email}
                </span>
              </div>
              <MoreVertical className="ml-auto size-4 text-primary/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border-sidebar-border bg-primary-foreground"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm bg-primary/10 rounded-t-md">
                <Avatar className="h-8 w-8 rounded-lg border border-primary/20">
                  <AvatarImage src={avatarSrc} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-muted-foreground">
                    {user.name}
                  </span>
                  <span className="text-muted-foreground/70 truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex gap-2 py-1.5 text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
