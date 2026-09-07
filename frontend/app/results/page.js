"use client";

// app/results/page.js  ->  calls GET /user/vote/count
//
// Your backend already sorts by voteCount descending and maps each
// candidate down to { party, count } - so this page just renders
// what it's given as horizontal bars.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

export default function ResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setFetching(true);
      setError("");
      try {
        const data = await apiFetch("/user/vote/count");
        setResults(data.response || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    })();
  }, [user]);

  if (loading || !user) return null;

  const maxCount = Math.max(1, ...results.map((r) => r.count));

  return (
    <main className="page">
      <div className="container">
        <h1 className="eyebrow-free-title">Results</h1>
        <p className="subtitle">Live vote counts by party, highest first.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {fetching && <p>Loading results...</p>}

        {!fetching &&
          results.map((r) => (
            <div className="result-row" key={r.party}>
              <div className="result-head">
                <span>{r.party}</span>
                <span>{r.count}</span>
              </div>
              <div className="result-track">
                <div
                  className="result-fill"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
