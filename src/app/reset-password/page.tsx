import Link from "next/link";
import { ResetForm } from "@/components/auth-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/login" className="text-xs tracking-[0.28em]">BACK</Link>
      <h1 className="display mt-6 text-5xl">Choose a new password</h1>
      <div className="mt-8"><ResetForm token={token} /></div>
    </main>
  );
}
