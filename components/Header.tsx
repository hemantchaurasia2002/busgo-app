"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  async function onSignOut() {
    await signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#d84e55]">
            busGo
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-[#3e3e52] sm:flex">
            <Link href="/" className="transition hover:text-[#d84e55]">
              Home
            </Link>
            <Link href="/search" className="transition hover:text-[#d84e55]">
              Bus tickets
            </Link>
          </nav>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-40 truncate text-sm font-medium text-[#3e3e52] sm:inline">
              {user.name || user.email}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border border-[#d84e55] px-4 py-2 text-sm font-semibold text-[#d84e55] transition hover:bg-[#d84e55] hover:text-white"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-[#d84e55] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b4232c]"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
