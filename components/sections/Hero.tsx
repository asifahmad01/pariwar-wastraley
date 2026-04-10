import { STORE_INFO } from "@/data/products";

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[min(40svh,300px)] flex-col justify-center overflow-hidden bg-hero sm:min-h-0 sm:block"
      aria-label="Hero"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8d5a3' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center px-4 py-7 sm:px-6 sm:py-20 lg:py-28">
        <p className="section-tag-gold mb-2 sm:mb-4">SHAHID ENTERPRISES &nbsp;·&nbsp; 10AIMPI7706B1ZS</p>
        <h1 className="font-display text-[1.65rem] font-semibold leading-tight tracking-tight text-cream sm:text-5xl lg:text-6xl">
          {STORE_INFO.nameEn}
        </h1>
        <p className="font-hindi mt-1.5 text-lg font-semibold text-gold-200 sm:mt-3 sm:text-3xl">{STORE_INFO.nameHi}</p>
        <p className="mt-2 text-sm text-cream/90 sm:mt-4 sm:text-xl">{STORE_INFO.address}</p>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-cream/95 sm:mt-4 sm:text-base lg:text-lg">{STORE_INFO.taglineHi}</p>
        <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
          <a href="#collection" className="btn-gold min-h-[44px] w-full justify-center px-5 py-2.5 text-sm sm:min-h-0 sm:w-auto sm:px-6 sm:py-3 sm:text-sm">
            Explore collection
          </a>
          <a href="#contact" className="btn-ghost min-h-[44px] w-full justify-center px-5 py-2.5 text-sm sm:min-h-0 sm:w-auto sm:px-6 sm:py-3 sm:text-sm">
            Visit our store
          </a>
        </div>
      </div>
    </section>
  );
}
