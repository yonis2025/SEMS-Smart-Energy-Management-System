
"use client";

import { API_URL } from "@/lib/api";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.fullName.trim().length < 2) {
      setError("Your full name must contain at least 2 characters.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            confirmPassword: form.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to create your account. Please try again."
        );
        return;
      }

      setMessage(
        data.message || "Your SEMS account was created successfully."
      );

      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("SEMS registration error:", error);

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
      {/* Header */}
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
              Already have an account?
            </span>

            <Link
              href="/login"
              className="rounded-full border border-[#0b3453] px-5 py-2.5 font-semibold text-[#0b3453] transition hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        {/* Left branding panel */}
        <section className="relative hidden min-h-[680px] overflow-hidden rounded-[32px] bg-[#052b47] lg:flex lg:flex-col lg:justify-between">
          <Image
            src="/images/solar-homes.jpeg"
            alt="Solar-powered residential homes"
            fill
            sizes="50vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#052b47]/95 via-[#052b47]/75 to-[#052b47]/85" />

          <div className="relative z-10 p-12">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-bold tracking-widest text-[#a6f16b]">
              WELCOME TO SEMS
            </span>

            <h1 className="mt-10 text-5xl font-extrabold leading-tight tracking-tight text-white">
              Smarter Energy.
              <span className="block text-[#8ae83c]">
                Better Living.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-white/85">
              Start understanding your electricity usage with a
              smarter, simpler energy management experience.
            </p>
          </div>

          <div className="relative z-10 grid gap-4 p-12">
            {[
              "Monitor your energy consumption",
              "Understand your electricity costs",
              "Explore usage trends and insights",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-medium text-white backdrop-blur-md"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5bc91a] text-sm font-bold">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Registration form */}
        <section className="mx-auto w-full max-w-[510px]">
          <div className="mb-8">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#48ae16]">
              Get Started
            </span>

            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#082542]">
              Create your account
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Join SEMS and take the first step toward smarter energy
              management.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_15px_50px_rgba(8,37,66,0.06)] sm:p-9"
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-[#082542]"
              >
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
                className={inputStyle}
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#082542]"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                className={inputStyle}
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#082542]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  className={`${inputStyle} pr-20`}
                  minLength={8}
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

              <p className="mt-2 text-xs text-slate-400">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-[#082542]"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`${inputStyle} pr-20`}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-4 text-xs font-semibold text-[#328c19] hover:text-[#206c10]"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* Success Message */}
            {message && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800"
              >
                <p className="font-semibold">✓ {message}</p>

                <p className="mt-2">
                  Your account is ready. You can now proceed to the
                  sign-in page.
                </p>

                <Link
                  href="/login"
                  className="mt-3 inline-block font-bold text-[#328c19] hover:underline"
                >
                  Go to Sign In →
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#4bbd0b] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-green-100 transition hover:bg-[#399a08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#329c08] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            SEMS — Smart Energy Management System
          </p>
        </section>
      </div>
    </main>
  );
}
