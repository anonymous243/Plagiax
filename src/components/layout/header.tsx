"use client"; 

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileSearch, LogOut } from "lucide-react"; 
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
  const { isAuthenticated, logout, isLoading: authIsLoading } = useAuth();

  const userName = "User"; // Placeholder, replace with actual user data if available

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileSearch className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Plagiax</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          {authIsLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" /> 
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    {/* data-ai-hint for AvatarImage can be added if an actual image source is used */}
                    {/* <AvatarImage src="https://picsum.photos/40/40" alt={userName} data-ai-hint="profile avatar" /> */}
                    <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    {/* <p className="text-xs leading-none text-muted-foreground">
                      user@example.com // Placeholder for email
                    </p> */}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Future items like Dashboard or Settings can be added here */}
                {/* <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <nav className="flex items-center gap-2 md:gap-4">
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
