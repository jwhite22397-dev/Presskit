import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/shell";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-5 py-12">
        <p className="border border-accent/40 px-3 py-2 text-xs uppercase tracking-[0.16em] text-accent">Draft for founder and legal review. Not legal advice.</p>
        <h1 className="display mt-6 text-5xl">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted">{children}</div>
        <Link href="/" className="mt-8 inline-block text-sm text-foreground underline">Home</Link>
      </article>
      <SiteFooter />
    </main>
  );
}
