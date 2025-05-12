
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Plagiax',
  description: 'Sign in to your Plagiax account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
