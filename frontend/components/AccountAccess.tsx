"use client";

import React, { useState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { useAccessibility } from "../lib/AccessibilityContext";
import { useAuth } from "../lib/AuthContext";


export default function AccountAccess() {
  const { elderMode } = useAccessibility();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The account request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex rounded-xl border border-line bg-paper p-1">
        {(["login", "register"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setError(null);
            }}
            className={`flex-1 rounded-lg px-4 py-2 font-semibold ${
              mode === option ? "bg-white text-shield shadow-sm" : "text-muted"
            }`}
          >
            {option === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="account-email" className="font-semibold text-ink">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink focus:border-shield focus:ring-2 focus:ring-shield/30 ${
              elderMode ? "text-xl" : "text-base"
            }`}
          />
        </div>
        <div>
          <label htmlFor="account-password" className="font-semibold text-ink">
            Password
          </label>
          <input
            id="account-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "register" ? 12 : 1}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink focus:border-shield focus:ring-2 focus:ring-shield/30 ${
              elderMode ? "text-xl" : "text-base"
            }`}
          />
          {mode === "register" && (
            <p className="mt-2 text-sm text-muted">Use at least 12 characters.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-shield px-5 py-3 font-semibold text-white hover:bg-shield-dark disabled:cursor-not-allowed disabled:bg-faint"
        >
          {busy ? (
            <LoaderCircle className="keep-color h-5 w-5 animate-spin" />
          ) : mode === "login" ? (
            <LogIn className="keep-color h-5 w-5" />
          ) : (
            <UserPlus className="keep-color h-5 w-5" />
          )}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm leading-relaxed text-muted">
        Public analysis remains stateless. A report is stored only when you explicitly save it, and saved document content is encrypted.
      </p>
    </div>
  );
}
