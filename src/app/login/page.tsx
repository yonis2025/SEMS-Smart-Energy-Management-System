
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const API_URL = "http://localhost:5001";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to sign in.");
        return;
      }

      setPassword("");
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the SEMS server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-[#082542] outline-none transition placeholder:text-slate-400 focus:border-[#49b51a] focus:ring-4 focus:ring-green-100";

  return (
    <main className="min-h-screen bg-[#f4f8fa]">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-10">
          <Link href="/" aria-label="SEMS home">
            <Image
              src="/images/sems-logo.png"
              alt="SEMS Smart Energy Management System"
              width={160}
              height={100}
              className="h-20 w-32 object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">
              New to SEMS?
            </span>

            <Link
              href="/register"
              className="rounded-full border border-[#0b3453] px-5 py-2.5 font-semibold text-[#0b3453] transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        <section className="relative hidden min-h-[650px] overflow-hidden rounded-[32px] bg-[#052b47] lg:flex lg:flex-col lg:justify-between">
          <Image
            src="/images/solar-homes.jpeg"
            alt="Residential homes with rooftop solar panels"
            fill
            sizes="50vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#052b47]/95 via-[#052b47]/75 to-[#052b47]/85" />

          <div className="relative z-10 p-12">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-bold tracking-widest text-[#a6f16b]">
              WELCOME BACK TO SEMS
            </span>

            <h1 className="mt-10 text-5xl font-extrabold leading-tight tracking-tight text-white">
              Your Energy.
              <span className="block text-[#8ae83c]">
                Your Future.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-white/85">
              A smarter way to understand electricity consumption,
              explore energy trends, and make informed decisions.
            </p>
          </div>

          <div className="relative z-10 grid gap-4 p-12">
            {[
              "Track your electricity usage",
              "Understand energy costs",
              "Make smarter energy decisions",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-medium text-white backdrop-blur-md"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5bc91a] text-sm font-bold">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[510px]">
          <div className="mb-8">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#48ae16]">
              Welcome Back
            </span>

            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#082542]">
              Sign in to SEMS
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Enter your account details to access your energy
              management dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_15px_50px_rgba(8,37,66,0.06)] sm:p-9"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#082542]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className={inputStyle}
                disabled={loading}
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#082542]"
                >
                  Password
                </label>

                <span className="text-xs text-slate-400">
                  Password recovery coming soon
                </span>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  className={`${inputStyle} pr-20`}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 text-xs font-semibold text-[#328c19] hover:text-[#206c10]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#4bbd0b] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-green-100 transition hover:bg-[#399a08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>

            <div className="border-t border-slate-100 pt-5 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#329c08] hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            SEMS — Smart Energy Management System
          </p>
        </section>
      </div>
    </main>
  );
}
