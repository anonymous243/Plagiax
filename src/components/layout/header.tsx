
"use client"; 

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileSearch, LogOut, Info, LayoutDashboard } from "lucide-react"; 
import { useAuth } from "@/context/AuthContext"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; 
import { Skeleton } from "@/components/ui/skeleton";


export function Header() {
  const { isAuthenticated, logout, isLoading: authIsLoading, currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileSearch className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Plagiax</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/about">
              <Info className="mr-1 h-4 w-4" /> About
            </Link>
          </Button>
          {authIsLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" /> 
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    {/* data-ai-hint for AvatarImage can be added if an actual image source is used */}
                    {/* <AvatarImage src="https://picsum.photos/40/40" alt={currentUser.fullName} data-ai-hint="profile avatar" /> */}
                    <AvatarFallback>{currentUser.fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {/* Future items like Settings can be added here */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <nav className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
