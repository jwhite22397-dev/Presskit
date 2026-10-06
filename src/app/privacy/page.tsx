import { LegalPage } from "@/components/legal";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>PRESSKIT stores the account email you use to sign in, the artist information you choose to publish, and files you upload.</p>
      <p>Public artist pages show only what you put on the site. Your login email is not published. Booking, management, and press emails are public because you entered them as contact methods.</p>
      <p>Visitor analytics, when enabled, record a page view or click, a random visitor id stored in that browser, and the referring site when the browser sends one. We do not fingerprint visitors and we do not sell personal data.</p>
      <p>Payments are processed by Stripe. PRESSKIT stores the resulting plan status, not full card numbers.</p>
      <p>You can export your artist content as JSON and delete your account from settings. Deletion removes the profile, site content, and uploaded media we control.</p>
      <p>This draft needs counsel review before you rely on it with customers.</p>
    </LegalPage>
  );
}
