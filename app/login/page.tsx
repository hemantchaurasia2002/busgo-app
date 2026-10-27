"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn.email({
      email,
      password,
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Login failed");
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (!isPending && session?.user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="animate-rise w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#d84e55]">
            Signed in
          </p>
          <h1 className="mt-2 text-2xl font-bold">{session.user.name || session.user.email}</h1>
          <button
            type="button"
            onClick={() => router.push(next)}
            className="mt-6 w-full rounded-xl bg-[#d84e55] px-3 py-3 font-bold text-white hover:bg-[#b4232c]"
          >
            Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        onSubmit={onSubmit}
        className="animate-rise w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Sign in to busGo</h1>
        <p className="mt-1 text-sm text-[#6b6b7b]">Email and password.</p>

        <label className="mt-6 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[#eadede] px-3 py-2.5 outline-none focus:border-[#d84e55]"
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[#eadede] px-3 py-2.5 outline-none focus:border-[#d84e55]"
        />

        {error ? <p className="mt-4 text-sm text-[#b4232c]">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-[#d84e55] px-3 py-3 font-bold text-white hover:bg-[#b4232c] disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
