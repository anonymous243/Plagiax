import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Plagiax',
  description: 'Login to your Plagiax account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
