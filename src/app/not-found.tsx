import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center px-6">
      <p className="text-xs uppercase tracking-[0.28em] text-accent">404</p>
      <h1 className="display mt-4 text-5xl">This page is not on the bill.</h1>
      <p className="mt-4 max-w-md text-muted">The artist may be unpublished, or the address changed.</p>
      <Link href="/" className="mt-8 bg-accent px-4 py-3 text-sm text-black">Back to PRESSKIT</Link>
    </main>
  );
}
