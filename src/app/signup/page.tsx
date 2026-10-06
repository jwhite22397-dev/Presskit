import Link from "next/link";
import { SignupForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="text-xs tracking-[0.35em]">PRESSKIT</Link>
      <h1 className="display mt-6 text-5xl">Build your PRESSKIT</h1>
      <p className="mt-3 text-muted">About ten minutes from a blank page to a site you can send.</p>
      <div className="mt-8"><SignupForm /></div>
      <p className="mt-6 text-sm text-muted">Already have an account? <Link href="/login" className="text-foreground underline">Log in</Link></p>
    </main>
  );
}
