import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Plagiax',
  description: 'Create a new Plagiax account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
