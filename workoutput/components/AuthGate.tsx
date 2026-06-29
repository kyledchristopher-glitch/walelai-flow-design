"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Real account gate, backed by Supabase Auth. Replaces the monolith's mock AuthGate where
// "Create a free account" simply called setTier("free"). Mandatory mode cannot be
// dismissed: there is no anonymous usage. On a successful magic link or OAuth round trip,
// the database trigger creates a profiles row with tier 'free'.
export default function AuthGate({ mandatory = true }: { mandatory?: boolean }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const site = typeof window !== "undefined" ? window.location.origin : "";

  async function sendLink() {
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${site}/auth/callback` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${site}/auth/callback` },
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(20,16,10,0.55)",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: 440,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e7e2da",
          padding: "26px 24px",
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>
          Create your free account to begin
        </h1>
        <p style={{ fontSize: 13.5, color: "#7a7062", margin: "0 0 18px" }}>
          An account is required to use WorkOutput. No card needed.
        </p>

        {sent ? (
          <p style={{ fontSize: 14 }}>Check your email for a sign-in link.</p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd6cc",
                marginBottom: 10,
                fontSize: 14,
              }}
            />
            <button
              onClick={sendLink}
              disabled={busy || !email}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 8,
                border: "none",
                background: "#b4541f",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              {busy ? "Sending..." : "Email me a sign-in link"}
            </button>
            <button
              onClick={google}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 8,
                border: "1px solid #ddd6cc",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Continue with Google
            </button>
            {err && <p style={{ color: "#b00020", fontSize: 13, marginTop: 10 }}>{err}</p>}
          </>
        )}
      </div>
    </div>
  );
}
