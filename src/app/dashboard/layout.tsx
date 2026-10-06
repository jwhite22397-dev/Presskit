import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { getSessionUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="md:flex">
      <DashboardNav plan={user.plan} />
      <div className="min-w-0 flex-1 px-5 py-6 pb-24 md:px-10 md:py-10">{children}</div>
    </div>
  );
}
