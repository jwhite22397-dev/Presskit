import Image from "next/image";
import Link from "next/link";
import { PLANS, formatPrice, getYearlySavings } from "@/config/plans";
import { SiteFooter, SiteHeader } from "@/components/marketing/shell";

const steps = [
  { n: "01", title: "Introduce yourself", body: "Name, city, genre, and a bio you can actually say out loud." },
  { n: "02", title: "Add the work", body: "Music, video, photos, shows, and the quotes you want in the room." },
  { n: "03", title: "Publish the link", body: "A site for fans. An EPK for the industry. One address in your bio." },
];

const features = [
  ["Artist website", "A public page with hierarchy, not a stack of icons."],
  ["Electronic press kit", "The same story, edited for bookers, press, and labels."],
  ["PDF export", "A printable one-sheet when someone asks for the deck."],
  ["Shows and tickets", "Upcoming dates stay separate from the ones you already played."],
  ["Press quotes", "Pull quotes, not a dump of logos."],
  ["Private analytics", "Views and link clicks. No creepy tracking."],
];

const templates = [
  ["Editorial", "Magazine layout. Large type. Black and white."],
  ["Night", "Concert darkness. A hero image that fills the phone."],
  ["Minimal", "Quiet, industry-facing, almost a one-sheet."],
  ["Neon", "Nightlife energy with the color kept on a leash. Pro."],
];

const audiences = ["Rappers", "Singers", "Producers", "DJs", "Bands", "Touring independents"];

const faqs = [
  ["Do I need a designer?", "No. You enter the information once. PRESSKIT handles the layout."],
  ["Can I use my own domain?", "Custom domains are a Pro feature. Connection is handled with support while automated provisioning is finished."],
  ["Is the EPK just a PDF?", "You get a clean link at /epk and, on Pro, a downloadable PDF."],
  ["Do you take a cut of my music?", "No. PRESSKIT does not distribute music or collect royalties."],
  ["Can I cancel Pro?", "Yes. Monthly and yearly plans can be canceled from the billing portal once Stripe is connected."],
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="px-5 pb-16 pt-8 md:px-10 md:pt-16">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">For independent artists</p>
        <h1 className="display mt-4 max-w-5xl text-[clamp(3.2rem,10vw,7.4rem)] leading-[0.86]">
          Your music deserves<br />more than a link-in-bio.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">Build a professional artist website and EPK in minutes.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="bg-accent px-5 py-4 text-center text-sm font-medium text-black">Build your PRESSKIT</Link>
          <Link href="/a/jaylensaint" className="border border-white/20 px-5 py-4 text-center text-sm">See an example</Link>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10">
        <div className="grid items-center gap-8 border border-line bg-[#0d0d0e] p-4 md:grid-cols-[280px_1fr] md:p-6">
          <div className="mx-auto w-[240px] overflow-hidden rounded-[1.8rem] border border-white/15 bg-black">
            <Image src="/demo/jaylen-hero.jpg" alt="Jaylen Saint on stage" width={960} height={540} className="h-72 w-full object-cover" priority />
            <div className="space-y-2 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Alternative hip-hop</p>
              <p className="display text-3xl leading-none">Jaylen Saint</p>
              <p className="text-xs text-muted">Phoenix, AZ</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Example artist</p>
            <h2 className="display mt-3 text-4xl md:text-6xl">This is what a finished page feels like.</h2>
            <p className="mt-4 max-w-lg text-muted">Jaylen Saint is fictional. The page is real: music, video, press, shows, photos, and an industry EPK.</p>
            <Link href="/a/jaylensaint" className="mt-6 inline-block text-sm underline">Open jaylensaint</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10" id="how">
        <h2 className="display text-4xl md:text-6xl">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <p className="text-xs tracking-[0.28em] text-accent">{step.n}</p>
              <h3 className="mt-3 text-2xl">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10" id="features">
        <h2 className="display text-4xl md:text-6xl">What you publish</h2>
        <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {features.map(([title, body]) => (
            <article key={title} className="bg-background p-6">
              <h3 className="text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10" id="templates">
        <h2 className="display text-4xl md:text-6xl">Four templates. Same music.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {templates.map(([name, body], index) => (
            <article key={name} className={`min-h-52 border p-5 ${index === 1 ? "bg-black text-white" : index === 3 ? "bg-[#120818] text-cyan-50" : "bg-paper text-ink"}`}>
              <h3 className="display text-3xl">{name}</h3>
              <p className="mt-4 text-sm opacity-70">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10">
        <h2 className="display text-4xl md:text-6xl">Who it&apos;s for</h2>
        <ul className="mt-8 flex flex-wrap gap-3">
          {audiences.map((item) => (
            <li key={item} className="border border-line px-4 py-2 text-sm">{item}</li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10" id="pricing">
        <h2 className="display text-4xl md:text-6xl">Pricing</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <PriceCard name={PLANS.free.name} price={formatPrice(0)} cadence="forever" points={PLANS.free.features} />
          <PriceCard name={PLANS.pro.name} price={formatPrice(PLANS.pro.price.monthly ?? 0)} cadence={`/month or ${formatPrice(PLANS.pro.price.yearly ?? 0)}/year · save ${formatPrice(getYearlySavings())}`} points={PLANS.pro.features} highlighted />
          <PriceCard name={PLANS.lifetime.name} price={formatPrice(PLANS.lifetime.price.lifetime ?? 0)} cadence="one time" points={PLANS.lifetime.features} />
        </div>
        <Link href="/signup" className="mt-8 inline-block bg-accent px-5 py-4 text-sm font-medium text-black">Build your PRESSKIT</Link>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10">
        <h2 className="display text-4xl">FAQ</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-4">
              <summary className="cursor-pointer text-lg">{question}</summary>
              <p className="mt-2 max-w-2xl text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <h2 className="display max-w-3xl text-5xl leading-none md:text-7xl">Put a real site in your bio.</h2>
        <Link href="/signup" className="mt-8 inline-block bg-accent px-5 py-4 text-sm font-medium text-black">Build your PRESSKIT</Link>
      </section>
      <SiteFooter />
    </main>
  );
}

function PriceCard({ name, price, cadence, points, highlighted = false }: { name: string; price: string; cadence: string; points: string[]; highlighted?: boolean }) {
  return (
    <article className={`border p-6 ${highlighted ? "border-accent bg-[#101208]" : "border-line"}`}>
      <h3 className="text-sm uppercase tracking-[0.22em]">{name}</h3>
      <p className="display mt-4 text-5xl">{price}</p>
      <p className="mt-2 text-sm text-muted">{cadence}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {points.map((point) => <li key={point}>{point}</li>)}
      </ul>
    </article>
  );
}
