import { LegalPage } from "@/components/legal";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <p>PRESSKIT lets you publish an artist website and electronic press kit. You are responsible for the text, images, music links, and claims you publish, including career highlights and press quotes.</p>
      <p>Do not upload content you do not have rights to use. Do not use the service to impersonate another artist.</p>
      <p>Free and paid plans are described on the pricing section. Paid access depends on a successful Stripe subscription or a manual grant from PRESSKIT. We may suspend a site that breaks the law or these terms.</p>
      <p>The service is provided as available. We do not guarantee bookings, press, or streaming performance.</p>
      <p>This draft needs counsel review before you accept payment under it.</p>
    </LegalPage>
  );
}
