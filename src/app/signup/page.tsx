import Link from "next/link";
import { SignupForm } from "@/components/auth-form";
import { referralSlug } from "@/lib/referral";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const ref = referralSlug((await searchParams).ref);
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="text-xs tracking-[0.35em]">PRESSKIT</Link>
      <h1 className="display mt-6 text-5xl">Create yours free</h1>
      <p className="mt-3 text-muted">About five minutes from your name to a page you can put in your bio.</p>
      <div className="mt-8"><SignupForm referral={ref} /></div>
      <p className="mt-6 text-sm text-muted">Already have an account? <Link href="/login" className="text-foreground underline">Log in</Link></p>
    </main>
  );
}
