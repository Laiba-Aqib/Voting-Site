"use client";

// app/signup/page.js  ->  calls POST /user/signup
//
// Your backend route (routes/userRoutes.js) expects a JSON body shaped
// like your User model: { name, age, email, password, cnic, mobile,
// address, role }. It creates the user, hashes the password (that
// happens in models/user.js's pre-save hook, nothing to do here), and
// sends back { response: savedUser, token }.
//
// This is a "use client" component because it uses useState (to hold
// form values) and onSubmit (a browser event handler) - Server
// Components can't do either.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  name: "",
  age: "",
  email: "",
  password: "",
  cnic: "",
  mobile: "",
  address: "",
  role: "voter",
};

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // age and cnic are Number fields on the backend schema, so we
      // convert the text-input strings before sending.
      const payload = {
        ...form,
        age: Number(form.age),
        cnic: Number(form.cnic),
      };
      const data = await apiFetch("/user/signup", {
        method: "POST",
        body: payload,
      });
      // data looks like { response: {...user}, token: "..." }
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
      <div className="container" style={{ maxWidth: 480 }}>
        <h1 className="eyebrow-free-title">Register to vote</h1>
        <p className="subtitle">
          Only one admin account can ever exist - your backend enforces
          that in the /user/signup route. Everyone else registers as a
          voter.
        </p>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {/* autoComplete="off" on the form stops the browser from treating
              this as a saved "address" form (name + email + mobile + address
              together is exactly the pattern browsers autofill from) */}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" autoComplete="off" value={form.name} onChange={handleChange} required />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="age">Age</label>
                <input id="age" name="age" autoComplete="off" type="number" value={form.age} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="cnic">CNIC (numbers only)</label>
                <input id="cnic" name="cnic" autoComplete="off" type="number" value={form.cnic} onChange={handleChange} required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email (optional)</label>
              <input id="email" name="email" autoComplete="off" type="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" autoComplete="off" type="password" value={form.password} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="mobile">Mobile (optional)</label>
              <input id="mobile" name="mobile" autoComplete="off" value={form.mobile} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" autoComplete="off" value={form.address} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="role">Register as</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value="voter">Voter</option>
                <option value="admin">Admin (only works if none exists yet)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="hint">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}