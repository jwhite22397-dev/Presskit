import Link from "next/link";
import { LoginForm } from "@/components/auth-form";
import { isDemoMode } from "@/lib/env";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="text-xs tracking-[0.35em]">PRESSKIT</Link>
      <h1 className="display mt-6 text-5xl">Log in</h1>
      <div className="mt-8"><LoginForm next={next} showDemo={isDemoMode()} /></div>
      <p className="mt-6 text-sm text-muted">New here? <Link href="/signup" className="text-foreground underline">Create an account</Link></p>
    </main>
  );
}
