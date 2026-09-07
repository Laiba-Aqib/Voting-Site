"use client";

// app/admin/page.js
//
// Admin-only screen for managing candidates.
//  - List:   GET  /user/candidates      (any logged-in user can call this,
//            but we only show this page to admins)
//  - Create: POST /candidate            (candidateRoutes.js checks
//            checkForAdmin() itself and returns 401 if you're not admin)
//  - Update: PUT  /candidate/:candidateId
//  - Delete: DELETE /candidate/:candidateId
//
// Because the backend already enforces "admin only" on create/update/
// delete, the check here on the frontend is purely for a better user
// experience (hiding the page + showing a friendly redirect) - it is
// NOT a substitute for the backend's own check.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

const emptyForm = { name: "", age: "", party: "" };

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = "creating new", else "editing this id"
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/candidates");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.role === "admin") loadCandidates();
  }, [user]);

  async function loadCandidates() {
    setFetching(true);
    setError("");
    try {
      const data = await apiFetch("/user/candidates");
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(candidate) {
    setEditingId(candidate._id);
    setForm({ name: candidate.name, age: candidate.age, party: candidate.party });
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    const payload = { ...form, age: Number(form.age) };
    try {
      if (editingId) {
        await apiFetch(`/candidate/${editingId}`, { method: "PUT", body: payload });
        setMessage("Candidate updated.");
      } else {
        await apiFetch("/candidate", { method: "POST", body: payload });
        setMessage("Candidate added.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadCandidates();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(candidateId) {
    setError("");
    setMessage("");
    try {
      await apiFetch(`/candidate/${candidateId}`, { method: "DELETE" });
      setMessage("Candidate deleted.");
      await loadCandidates();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading || !user || user.role !== "admin") return null;

  return (
    <main className="page">
      <div className="container">
        <h1 className="eyebrow-free-title">Manage candidates</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>
            {editingId ? "Edit candidate" : "Add a candidate"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="age">Age</label>
                <input id="age" name="age" type="number" value={form.age} onChange={handleChange} required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="party">Party</label>
              <input id="party" name="party" value={form.party} onChange={handleChange} required />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Save changes" : "Add candidate"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {fetching ? (
          <p>Loading candidates...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Party</th>
                <th>Age</th>
                <th>Votes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.party}</td>
                  <td>{c.age}</td>
                  <td>{c.voteCount}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(c._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
