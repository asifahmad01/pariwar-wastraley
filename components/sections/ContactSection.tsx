import { STORE_INFO } from "@/data/products";
import { waLink } from "@/lib/utils";

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 border-t border-gold-500/15 bg-cream-gradient py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="section-tag">Visit us</span>
          <h2 className="font-display mt-3 text-3xl font-semibold text-maroon-900 sm:text-4xl">We&apos;d love to see you</h2>
          <p className="mx-auto mt-2 max-w-lg text-maroon-800/75">Step in for fabrics, fits, and festive finds for the whole family.</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gold-500/25 bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-display text-xl font-semibold text-maroon-900">{STORE_INFO.nameEn}</h3>
            <p className="font-hindi mt-1 text-sm text-maroon-800/70">{STORE_INFO.nameHi}</p>
            <address className="mt-4 not-italic text-maroon-900/85">
              <p className="font-medium">{STORE_INFO.address}</p>
              <p className="mt-3">
                <span className="text-maroon-800/60">Phone: </span>
                <a href={`tel:${STORE_INFO.phone.replace(/\s/g, "")}`} className="font-semibold hover:underline">
                  {STORE_INFO.phone}
                </a>
              </p>
              <p className="mt-2 text-sm text-maroon-800/65">{STORE_INFO.hours}</p>
            </address>
            <a
              href={waLink(STORE_INFO.whatsapp, "Hello! I'm interested in your clothing collection.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-6 w-full justify-center sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>

          <a
            href="https://maps.app.goo.gl/56W2L7YsJoHp3Bar5?g_st=aw"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-gold-500/25 bg-cream-200/80 shadow-card transition-shadow hover:shadow-card-hover"
            aria-label="Open in Google Maps"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-maroon-700/60 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="font-display font-semibold text-maroon-900">View on Google Maps</p>
            <p className="mt-1 text-xs text-maroon-800/60">Near Deep Mission School, Main Road Roh</p>
            <span className="mt-4 rounded-full bg-maroon-900 px-4 py-1.5 text-xs font-semibold text-cream transition-colors group-hover:bg-maroon-800">
              Open Maps →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
