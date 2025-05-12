
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GoogleIcon } from "@/components/icons/google-icon";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { login, isLoading: authIsLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLoginError(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const storedUsersString = localStorage.getItem('plagiax_users');
      const storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];
      
      const user = storedUsers.find((u: any) => u.email === values.email);

      if (!user) {
        const errorMsg = "No account found with this email. Please sign up.";
        setLoginError(errorMsg);
        toast({
          title: "Sign In Failed",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // For "google_signed_up" users, we don't check password here, 
      // as they'd typically sign in via Google again.
      // This check is for regular email/password signups.
      if (user.password !== values.password && user.password !== "google_signed_up_dummy_password") {
        const errorMsg = "Incorrect password. Please try again.";
        setLoginError(errorMsg);
        toast({
          title: "Sign In Failed",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (user.password === "google_signed_up_dummy_password") {
         toast({
          title: "Sign In Successful!",
          description: "It looks like you signed up with Google. Please use the 'Sign in with Google' option for the best experience.",
          variant: "default",
          duration: 7000,
        });
        // Optionally, could still log them in, but guiding to Google button is better UX
        // login(user.email, user.fullName);
        setIsLoading(false);
        // If user used Google to signup, they should use Google to sign in. 
        // However, if they somehow try to sign in with email/pass (and we have a dummy pass),
        // we let them know. We don't log them in here to enforce Google Sign-In.
        return; 
      }


      toast({
        title: "Sign In Successful!",
        description: "You're now being redirected to the plagiarism checker.",
      });
      login(user.email, user.fullName); 
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = "An unexpected error occurred during sign in.";
      setLoginError(errorMsg);
      toast({
        title: "Sign In Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setLoginError(null);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate Google OAuth flow

    const googleEmail = window.prompt("Simulating Google Sign-In...\nPlease enter your Google email:");
    if (!googleEmail) {
      toast({ title: "Google Sign-In Cancelled", variant: "default" });
      setIsGoogleLoading(false);
      return;
    }
    
    // Full name is not strictly needed for login if user exists, but good for consistency with signup flow if we were to create user.
    // For login, we'll fetch it from the existing user record.
    // let googleFullName = window.prompt("Please enter your full name (as on Google):");
    //  if (!googleFullName) {
    //   googleFullName = googleEmail.split('@')[0]; // Fallback name
    // }


    try {
      const storedUsersString = localStorage.getItem('plagiax_users');
      const storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];
      const existingUser = storedUsers.find((u: any) => u.email === googleEmail);

      if (existingUser) {
        // User exists, log them in
        toast({
          title: "Signed In with Google!",
          description: "Welcome back! Redirecting...",
        });
        login(existingUser.email, existingUser.fullName);
      } else {
        // User does not exist. Do NOT create an account from login page.
        const errorMsg = "No account found with this Google email. Please sign up first.";
        setLoginError(errorMsg);
        toast({
          title: "Google Sign-In Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      const errorMsg = "An unexpected error occurred during Google Sign-In.";
      setLoginError(errorMsg); 
      toast({
        title: "Google Sign-In Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }


  return (
    <Card className="w-full max-w-md shadow-xl rounded-xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <LogIn className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back!</CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          Sign in to access your Plagiax account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      className="text-base py-5 rounded-lg"
                      disabled={isLoading || authIsLoading || isGoogleLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="text-base py-5 rounded-lg"
                      disabled={isLoading || authIsLoading || isGoogleLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loginError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign In Error</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full text-lg py-6 rounded-lg" disabled={isLoading || authIsLoading || isGoogleLoading}>
              {isLoading ? <Spinner className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" /> }
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 text-center text-sm pt-6">
        <div className="flex items-center w-full">
          <hr className="flex-grow border-border" />
          <span className="mx-3 text-xs text-muted-foreground">OR</span>
          <hr className="flex-grow border-border" />
        </div>
        <Button
          variant="outline"
          className="w-full text-base py-6 rounded-lg flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || authIsLoading || isLoading}
        >
          {isGoogleLoading ? <Spinner className="h-5 w-5" /> : <GoogleIcon className="h-5 w-5" />}
          Sign in with Google
        </Button>
        <p className="text-muted-foreground mt-2">
          Don't have an account?{" "}
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link href="/signup">Sign up</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
