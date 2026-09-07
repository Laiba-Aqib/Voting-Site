"use client";

// app/candidates/page.js
//
// Lists candidates from GET /user/candidates (protected route) and
// lets a voter cast a vote via POST /user/vote/:candidateId.
//
// Vote counts are deliberately NOT shown here - this is the ballot,
// not the results. See app/results/page.js for GET /user/vote/count.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

export default function CandidatesPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [votingId, setVotingId] = useState(null); // which candidate's button is mid-request
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadCandidates();
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

  async function handleVote(candidateId) {
    setError("");
    setMessage("");
    setVotingId(candidateId);
    try {
      const data = await apiFetch(`/user/vote/${candidateId}`, { method: "POST" });
      setMessage(data.message || "Vote cast.");
      await refreshUser(); // pulls the updated isVoted flag from /user/profile
    } catch (err) {
      setError(err.message);
    } finally {
      setVotingId(null);
    }
  }

  if (loading || !user) return null;

  return (
    <main className="page">
      <div className="container">
        <h1 className="eyebrow-free-title">Candidates</h1>
        <p className="subtitle">
          {user.role === "admin"
            ? "Admin accounts cannot vote - your backend blocks this on purpose."
            : user.isVoted
            ? "You have already cast your vote. Thank you for participating."
            : "Choose one candidate below. You can only vote once."}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {fetching && <p>Loading candidates...</p>}

        {!fetching && candidates.length === 0 && (
          <p className="hint">No candidates have been added yet.</p>
        )}

        {!fetching && candidates.length > 0 && (
          <ul className="ballot">
            {candidates.map((c, i) => (
              <li className="ballot-item" key={c._id}>
                <span className="ballot-number">{i + 1}</span>
                <div className="ballot-info">
                  <div className="ballot-name">{c.name}</div>
                  <div className="ballot-meta">{c.party}</div>
                </div>
                <button
                  className="btn btn-gold"
                  disabled={user.role === "admin" || user.isVoted || votingId === c._id}
                  onClick={() => handleVote(c._id)}
                >
                  {votingId === c._id ? "Casting..." : "Vote"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
