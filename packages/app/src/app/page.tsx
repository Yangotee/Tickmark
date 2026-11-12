const steps = [
  {
    number: "01",
    title: "Find the code",
    description:
      "Look for the Tickmark code on the product label, usually under a scratch panel.",
  },
  {
    number: "02",
    title: "Check it your way",
    description:
      "Send the code by SMS, USSD, or use the app. No special equipment is needed.",
  },
  {
    number: "03",
    title: "Know what to do",
    description:
      "Get a clear result and next steps before you use or buy the product.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#18271f]">
      <a
        className="sr-only z-50 rounded bg-white p-3 text-[#18271f] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="border-b border-[#dce4dc]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a className="text-xl font-bold tracking-tight" href="/" aria-label="Tickmark home">
            tickmark<span className="text-[#20804d]">.</span>
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm">
            <a className="hover:underline focus-visible:underline" href="#how-it-works">
              How it works
            </a>
            <a
              className="rounded-full bg-[#176b3e] px-4 py-2 font-semibold text-white hover:bg-[#125832] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b3e]"
              href="#for-business"
            >
              For businesses
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section
          aria-labelledby="hero-title"
          className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-28"
        >
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-[#176b3e]">
              A clearer way to check
            </p>
            <h1 id="hero-title" className="max-w-2xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Know what you&apos;re buying.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4c5d52]">
              Check a product code in seconds and get a plain-language answer
              before you buy or use it. No app or data plan required.
            </p>
            <a
              className="mt-8 inline-flex rounded-full bg-[#176b3e] px-6 py-3 font-semibold text-white hover:bg-[#125832] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b3e]"
              href="#how-it-works"
            >
              See how it works
            </a>
          </div>

          <aside
            aria-label="Example product check"
            className="rounded-3xl border border-[#dce4dc] bg-white p-7 shadow-sm"
          >
            <p className="text-sm font-semibold text-[#65756a]">A sample result</p>
            <div className="mt-5 flex items-center gap-3">
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-[#e6f4e9] text-xl text-[#176b3e]">
                &#10003;
              </span>
              <div>
                <p className="font-bold text-[#176b3e]">GENUINE</p>
                <p className="text-sm text-[#65756a]">First check</p>
              </div>
            </div>
            <div className="mt-6 border-t border-[#e7ece7] pt-5">
              <p className="font-semibold">Product name</p>
              <p className="mt-1 text-sm text-[#65756a]">Batch B2210 · Exp 03/2028</p>
            </div>
            <p className="mt-5 rounded-xl bg-[#f7f8f3] p-4 text-sm leading-6 text-[#4c5d52]">
              Example only. Tickmark checks each code against a registered
              product batch.
            </p>
          </aside>
        </section>

        <section
          aria-labelledby="steps-title"
          className="bg-white py-20"
          id="how-it-works"
        >
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#176b3e]">
              Simple for everyone
            </p>
            <h2 id="steps-title" className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              A check that fits in your pocket.
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <li className="border-t-2 border-[#b8d7c0] pt-5" key={step.number}>
                  <p className="text-sm font-bold text-[#176b3e]">{step.number}</p>
                  <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#4c5d52]">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="business-title"
          className="mx-auto max-w-6xl px-6 py-20"
          id="for-business"
        >
          <div className="rounded-3xl bg-[#163d2a] px-7 py-10 text-white md:px-12 md:py-14">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#a9d8b7]">
              For manufacturers
            </p>
            <h2 id="business-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Give every product a story buyers can verify.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[#e1eee4]">
              Register product batches, help customers check codes, and make it
              easier to spot suspicious activity.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dce4dc]">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-[#65756a]">
          Tickmark helps buyers make more informed product checks.
        </div>
      </footer>
    </div>
  );
}
