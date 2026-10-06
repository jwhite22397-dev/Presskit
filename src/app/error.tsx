"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col justify-center px-6">
      <h1 className="display text-5xl">Something went wrong.</h1>
      <p className="mt-3 max-w-md text-muted">The details stayed in the server log. Try again, or come back from the home page.</p>
      <button type="button" onClick={reset} className="mt-6 w-fit bg-accent px-4 py-3 text-sm text-black">Try again</button>
    </main>
  );
}
