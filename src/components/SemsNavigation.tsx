
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const API_URL = "http://localhost:5001";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Analytics", href: "/analytics" },
  { name: "Recommendations", href: "/recommendations" },
  { name: "Reports", href: "/reports" },
];

export default function SemsNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to sign out. Please try again."
        );
      }

      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sems-no-print sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* SEMS Logo */}
        <Link
          href="/dashboard"
          onClick={() => setMenuOpen(false)}
          className="flex h-full w-40 shrink-0 items-center justify-start sm:w-44 lg:w-48"
          aria-label="SEMS Dashboard"
        >
          <Image
            src="/images/sems-logo.png"
            alt="SEMS Smart Energy Management System"
            width={220}
            height={120}
            priority
            className="h-20 w-full object-contain object-left"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 items-center justify-center gap-1 lg:flex"
        >
          {navigationItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-xl px-3 py-3 text-sm font-semibold transition-colors xl:px-4 ${
                  active
                    ? "bg-[#eaf8e5] text-[#328c19]"
                    : "text-[#082542] hover:bg-slate-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="hidden shrink-0 whitespace-nowrap rounded-full border border-[#0b3453] px-4 py-2.5 text-sm font-semibold text-[#0b3453] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 lg:block xl:px-5"
        >
          {loggingOut ? "Signing Out..." : "Sign Out"}
        </button>

        {/* Mobile / Tablet Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={menuOpen}
          aria-controls="sems-mobile-navigation"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#082542] transition-colors hover:bg-slate-50 lg:hidden"
        >
          {menuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile / Tablet Navigation */}
      {menuOpen && (
        <nav
          id="sems-mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 shadow-sm sm:px-6 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigationItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#eaf8e5] text-[#328c19]"
                      : "text-[#082542] hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        </nav>
      )}

      {/* Logout Error */}
      {logoutError && (
        <div
          role="alert"
          className="border-t border-red-100 bg-red-50 px-5 py-3 text-center text-sm text-red-700"
        >
          {logoutError}
        </div>
      )}
    </header>
  );
}
