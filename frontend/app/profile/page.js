"use client";

// app/profile/page.js
//
// Reads the logged-in user from AuthContext (which got it from
// GET /user/profile) and lets them change their password via
// PUT /user/profile/password, which your backend expects as
// { currentPassword, newPassword }.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // This effect is the guard: once we know for sure there's no user
  // (loading finished, user is still null), send them to /login.
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await apiFetch("/user/profile/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
      });
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null; // avoid flashing content before the redirect check runs

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 className="eyebrow-free-title">Your profile</h1>

        <div className="card" style={{ marginBottom: 24 }}>
          <table className="table">
            <tbody>
              <tr>
                <th>Name</th>
                <td>{user.name}</td>
              </tr>
              <tr>
                <th>CNIC</th>
                <td>{user.cnic}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{user.address}</td>
              </tr>
              <tr>
                <th>Role</th>
                <td>
                  <span className="badge">{user.role}</span>
                </td>
              </tr>
              <tr>
                <th>Voting status</th>
                <td>{user.isVoted ? "Vote cast" : "Not voted yet"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Change password</h2>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="field">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
