import { SiteFooter, SiteHeader } from "@/components/marketing/shell";
import { SupportForm } from "@/components/support-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-xl px-5 py-12">
        <h1 className="display text-5xl">Contact</h1>
        <p className="mt-3 text-muted">Booking a done-for-you page, press, or a partnership. We reply by email.</p>
        <SupportForm topicDefault="Contact" />
      </section>
      <SiteFooter />
    </main>
  );
}
