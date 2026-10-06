import { redirect } from "next/navigation";
import { GrantForm } from "@/components/admin/grant-form";
import { getSessionUser } from "@/server/auth";
import { listDirectory } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/dashboard");
  let rows: Awaited<ReturnType<typeof listDirectory>> = [];
  let error: string | null = null;
  try {
    rows = await listDirectory();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load accounts.";
  }
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="display text-5xl">Admin</h1>
      <p className="mt-3 text-sm text-muted">Grant Pro or Founding Artist without Stripe. Server-side only.</p>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-muted">
            <tr><th className="py-2">Artist</th><th>Plan</th><th>Site</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="py-3">{row.name || row.email}<br /><span className="text-xs text-muted">{row.email}</span></td>
                <td>{row.plan}</td>
                <td>{row.slug} · {row.status}</td>
                <td><GrantForm userId={row.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
