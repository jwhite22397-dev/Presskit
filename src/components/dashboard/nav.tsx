"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/site", label: "My page" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/analytics", label: "Audience" },
  { href: "/dashboard/account", label: "Account" },
];

export function DashboardNav({ plan }: { plan: string }) {
  const pathname = usePathname();
  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-line p-5 md:flex md:min-h-screen md:flex-col">
        <Link href="/" className="text-xs tracking-[0.35em]">PRESSKIT</Link>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{plan}</p>
        <nav className="mt-8 grid gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`px-3 py-2 text-sm ${active ? "bg-white text-black" : "text-muted"}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="mt-auto">
          <button className="text-sm text-muted">Log out</button>
        </form>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-[#070708] md:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`px-1 py-3 text-center text-[10px] uppercase tracking-[0.08em] ${active ? "text-accent" : "text-muted"}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
