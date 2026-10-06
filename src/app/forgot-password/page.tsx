import Link from "next/link";
import { ForgotForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/login" className="text-xs tracking-[0.28em]">BACK</Link>
      <h1 className="display mt-6 text-5xl">Reset password</h1>
      <div className="mt-8"><ForgotForm /></div>
    </main>
  );
}
