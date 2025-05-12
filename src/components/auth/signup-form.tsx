"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [signupError, setSignupError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { login, isLoading: authIsLoading } = useAuth(); // Use login from AuthContext

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSignupError(null);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    try {
      const storedUsersString = localStorage.getItem('plagiax_users');
      let storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];

      if (storedUsers.find((u: any) => u.email === values.email)) {
        const errorMsg = "An account with this email already exists. Please try signing in.";
        setSignupError(errorMsg);
        toast({
          title: "Signup Failed",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      storedUsers.push({ email: values.email, password: values.password, fullName: values.fullName });
      localStorage.setItem('plagiax_users', JSON.stringify(storedUsers));

      toast({
        title: "Account Created!",
        description: "You will now be redirected to the sign-in page.",
      });
      router.push('/login'); // Redirect to login page after successful signup
    } catch (error) {
      console.error("Signup error:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setSignupError(errorMsg);
      toast({
        title: "Signup Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true);
    setSignupError(null);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate Google OAuth flow

    const googleEmail = window.prompt("Simulating Google Sign-Up...\nPlease enter your Google email to proceed. Pressing Cancel or leaving empty will abort.");
    if (!googleEmail) {
      toast({ title: "Google Sign-Up Cancelled", description: "No email was provided or the prompt was cancelled.", variant: "default" });
      setIsGoogleLoading(false);
      return;
    }

    let googleFullName = window.prompt("Please enter your full name (as on Google):");
     if (!googleFullName) {
      googleFullName = googleEmail.split('@')[0]; // Fallback name
    }

    try {
      const storedUsersString = localStorage.getItem('plagiax_users');
      let storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];
      const existingUser = storedUsers.find((u: any) => u.email === googleEmail);

      if (existingUser) {
        // User already exists, sign them in
        toast({
          title: "Signed In with Google!",
          description: "An account with this Google email already exists. Signing you in...",
        });
        login(existingUser.email, existingUser.fullName); // Use login from AuthContext
      } else {
        // New user, create account and sign them in
        const newUser = { email: googleEmail, fullName: googleFullName, password: "google_signed_up_dummy_password" }; // Dummy password
        storedUsers.push(newUser);
        localStorage.setItem('plagiax_users', JSON.stringify(storedUsers));
        
        toast({
          title: "Account Created & Signed In!",
          description: "Welcome to Plagiax! Your account has been created with Google. Redirecting...",
        });
        login(newUser.email, newUser.fullName); // Use login from AuthContext
      }
    } catch (error) {
      console.error("Google Sign-Up error:", error);
      const errorMsg = "An unexpected error occurred during Google Sign-Up.";
      setSignupError(errorMsg);
      toast({
        title: "Google Sign-Up Failed",
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
            <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          Join Plagiax today to start checking your documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
                      placeholder="•••••••• (min. 8 characters)"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Confirm Password</FormLabel>
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
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || authIsLoading || isGoogleLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      I agree to the{" "}
                      <Button variant="link" asChild className="p-0 h-auto text-primary text-sm">
                        <Link href="/terms" target="_blank" rel="noopener noreferrer">terms and conditions</Link>
                      </Button>
                      .
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
             {signupError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign Up Error</AlertTitle>
                <AlertDescription>{signupError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full text-lg py-6 rounded-lg" disabled={isLoading || authIsLoading || isGoogleLoading}>
              {isLoading ? <Spinner className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" /> }
              {isLoading ? "Creating Account..." : "Create Account"}
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
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || authIsLoading || isLoading}
        >
          {isGoogleLoading ? <Spinner className="h-5 w-5" /> : <GoogleIcon className="h-5 w-5" />}
          Sign up with Google
        </Button>
        <p className="text-muted-foreground mt-2">
          Already have an account?{" "}
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link href="/login">Sign in</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
