import { SiteFooter, SiteHeader } from "@/components/marketing/shell";
import { SupportForm } from "@/components/support-form";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-xl px-5 py-12">
        <h1 className="display text-5xl">Support</h1>
        <p className="mt-3 text-muted">Trouble publishing, uploading, or upgrading? Send a note. Password resets are handled from the login page.</p>
        <SupportForm topicDefault="Support" />
      </section>
      <SiteFooter />
    </main>
  );
}
