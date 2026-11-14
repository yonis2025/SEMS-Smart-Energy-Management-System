
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "▥",
    title: "Energy Monitoring",
    description:
      "Keep your electricity records organized and understand how your energy is being used.",
  },
  {
    icon: "↗",
    title: "Cost Analysis",
    description:
      "Explore consumption trends, estimate electricity costs, and identify opportunities to save.",
  },
  {
    icon: "♧",
    title: "Sustainability Insights",
    description:
      "Make informed energy decisions and develop more sustainable habits.",
  },
  {
    icon: "◷",
    title: "Smart Alerts",
    description:
      "Identify unusual consumption patterns and stay aware of high-energy usage.",
  },
];

const chart = [32, 45, 39, 63, 51, 76, 66];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#082542]">
      {/* Navigation */}
      <header className="relative z-20 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-3 md:px-10 lg:px-16">
          <Link href="/" aria-label="SEMS home" className="shrink-0">
            <Image
              src="/images/sems-logo.png"
              alt="SEMS Smart Energy Management System"
              width={220}
              height={220}
              priority
              className="h-[74px] w-[110px] object-contain object-left md:h-[82px] md:w-[145px]"
            />
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 text-sm font-semibold text-[#16314c] lg:flex"
          >
            <a href="#home" className="text-[#3caa0a]">
              Home
            </a>
            <a href="#features" className="transition hover:text-[#3caa0a]">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-[#3caa0a]">
              How It Works
            </a>
            <a href="#about" className="transition hover:text-[#3caa0a]">
              About
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full border border-[#0b3453] px-4 py-2.5 text-xs font-bold transition hover:bg-slate-50 sm:px-6 sm:text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#44b900] px-4 py-2.5 text-xs font-bold text-white shadow-[0_5px_16px_rgba(68,185,0,0.22)] transition hover:bg-[#339500] sm:px-6 sm:text-sm"
            >
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative isolate overflow-hidden bg-[#052b47]"
      >
        <Image
          src="/images/solar-homes.jpeg"
          alt="Residential townhouses equipped with rooftop solar panels"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#032641]/95 via-[#032641]/80 to-[#032641]/25" />

        <div className="relative mx-auto grid min-h-[610px] max-w-[1440px] items-center gap-12 px-5 py-16 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-24">
          <div className="max-w-[680px]">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md sm:text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#83e92b]" />
              SMART · EFFICIENT · SUSTAINABLE
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.07] tracking-tight text-white sm:text-6xl xl:text-[76px]">
              Smarter Energy.
              <span className="mt-2 block text-[#84e523]">
                Better Living.
              </span>
            </h1>

            <p className="mt-7 max-w-[550px] text-base leading-8 text-white/85 sm:text-lg">
              Take control of your electricity consumption with SEMS.
              Track energy usage, understand costs, explore trends, and
              make smarter decisions for a more sustainable future.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#55c900] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-green-950/20 transition hover:bg-[#43ac00]"
              >
                Get Started Free <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-white/70 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Explore SEMS <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/90">
              <span>✓ Simple tracking</span>
              <span>✓ Clear insights</span>
              <span>✓ Better decisions</span>
            </div>
          </div>

          {/* Illustrative dashboard */}
          <div className="w-full max-w-[590px] justify-self-end rounded-[28px] border border-white/25 bg-[#062c47]/85 p-5 text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9cdb9c]">
                  SEMS Dashboard Preview
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Energy Overview
                </h2>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs">
                Sample Data
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-white/70">Energy Usage</p>
                <p className="mt-2 text-2xl font-extrabold">326.4</p>
                <p className="text-xs text-[#a4ec5a]">kWh this month</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs text-white/70">Estimated Cost</p>
                <p className="mt-2 text-2xl font-extrabold">$48.27</p>
                <p className="text-xs text-[#a4ec5a]">Illustrative</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 sm:col-span-1">
                <p className="text-xs text-white/70">Usage Change</p>
                <p className="mt-2 text-2xl font-extrabold">−18%</p>
                <p className="text-xs text-[#a4ec5a]">Sample comparison</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold">Weekly Energy Trend</h3>
                <span className="text-xs text-white/60">Demo values</span>
              </div>
              <div className="mt-6 flex h-40 items-end justify-between gap-3 border-b border-white/20">
                {chart.map((height, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-1 items-end"
                  >
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#168d9b] to-[#85e821]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 text-center text-[10px] text-white/65 sm:text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  )
                )}
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/60">
              Preview only. Actual usage and cost information will
              appear after the database and dashboard are connected.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#f6fafb] px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1300px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#3caa0a]">
              Our Features
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#082542] sm:text-4xl">
              Everything you need to understand your energy
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              A simple platform designed to make energy information
              easier to record, explore, and manage.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-[#e4eced] bg-white p-7 shadow-[0_12px_35px_rgba(6,43,71,0.05)] transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f8db] text-3xl font-bold text-[#3caa0a]">
                  {feature.icon}
                </div>
                <h3 className="mt-7 text-lg font-bold text-[#082542]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#3caa0a]">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Better energy decisions in three steps
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create an account",
                text: "Set up your SEMS profile to manage your energy information.",
              },
              {
                number: "02",
                title: "Record your usage",
                text: "Add electricity readings and the information needed to estimate costs.",
              },
              {
                number: "03",
                title: "Explore your insights",
                text: "Review charts, compare trends, and identify areas for improvement.",
              },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e8f8e2] text-2xl font-extrabold text-[#329c08]">
                  {step.number}
                </div>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="bg-[#062d49] px-5 py-20 text-white md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#91e849]">
              About SEMS
            </p>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Technology for a smarter, greener future.
            </h2>
            <p className="mt-5 leading-8 text-white/75">
              SEMS is a smart energy management web application
              designed to help individuals and communities better
              understand electricity consumption and make informed
              energy choices.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 rounded-full bg-[#55c900] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#43ac00]"
          >
            Start Your Journey →
          </Link>
        </div>
      </section>

      <footer className="bg-[#041e31] px-5 py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} SEMS — Smart Energy Management System.
        Built for COMP229 Web Application Development.
      </footer>
    </main>
  );
}
