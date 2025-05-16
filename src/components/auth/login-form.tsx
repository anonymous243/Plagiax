
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

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
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

      if (user.password !== values.password) {
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

  return (
    <Card className="w-full max-w-md shadow-xl rounded-xl bg-card/70 backdrop-blur-md border border-border/30">
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
                      disabled={isLoading || authIsLoading}
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
                      disabled={isLoading || authIsLoading}
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
            <Button type="submit" className="w-full text-lg py-6 rounded-lg" disabled={isLoading || authIsLoading}>
              {isLoading ? <Spinner className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" /> }
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 text-center text-sm pt-6">
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
