import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-5 md:px-10">
      <Link href="/" className="text-sm tracking-[0.35em]">PRESSKIT</Link>
      <nav className="flex items-center gap-5 text-sm">
        <Link href="/#pricing" className="hidden sm:inline">Pricing</Link>
        <Link href="/login">Log in</Link>
        <Link href="/signup" className="bg-accent px-3 py-2 text-black">Build yours</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 py-10 text-sm text-muted md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="tracking-[0.35em] text-foreground">PRESSKIT</p>
          <p className="mt-2 max-w-xs">A professional artist website and electronic press kit.</p>
        </div>
        <div className="flex gap-10">
          <div className="grid gap-2">
            <Link href="/a/jaylensaint">Example</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/support">Support</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="grid gap-2">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
