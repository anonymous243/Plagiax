
"use client"; 

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Info, LayoutDashboard, LineChart as AnalyticsIcon, Menu } from "lucide-react"; 
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import * as React from "react";

export function Header() {
  const { isAuthenticated, logout, isLoading: authIsLoading, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = (
    <>
      <Button variant="ghost" asChild className="text-sm w-full justify-start md:w-auto" onClick={() => setIsMobileMenuOpen(false)}>
        <Link href="/about">
          <Info className="mr-1 h-4 w-4" /> About
        </Link>
      </Button>
      {authIsLoading ? (
        <div className="flex items-center gap-2 px-4 py-2 md:px-0 md:py-0">
          <Skeleton className="h-8 w-20 rounded-md" /> 
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      ) : isAuthenticated && currentUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
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
            <DropdownMenuItem asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setIsMobileMenuOpen(false)}>
              <Link href="/analytics">
                <AnalyticsIcon className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="ghost" asChild className="w-full justify-start md:w-auto" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="w-full md:w-auto" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">Checker</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          {navLinks}
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 pt-16 bg-background">
              <nav className="flex flex-col gap-4">
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
