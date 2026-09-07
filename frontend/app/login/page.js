"use client";

// app/login/page.js  ->  calls POST /user/login
//
// Your backend (routes/userRoutes.js) expects { cnic, password } and,
// on success, returns only { token }. Notice it does NOT return the
// user object here - that's why AuthContext separately calls
// GET /user/profile right after we store the token.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await apiFetch("/user/login", {
        method: "POST",
        body: { cnic: Number(cnic), password },
      });
      login(data.token);
      router.push("/candidates");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1 className="eyebrow-free-title">Log in</h1>
        <p className="subtitle">Use the CNIC and password you registered with.</p>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="cnic">CNIC</label>
              <input id="cnic" type="number" value={cnic} onChange={(e) => setCnic(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="hint">
          New here? <Link href="/signup">Register to vote</Link>
        </p>
      </div>
    </main>
  );
}
