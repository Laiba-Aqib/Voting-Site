import Link from "next/link";

// This page has no useState/useEffect, so it stays a plain Server
// Component (no "use client" needed) - it's just markup.

export default function HomePage() {
  return (
    <main className="page">
      <div className="container">
        <h1 className="eyebrow-free-title">A clear, verifiable way to vote.</h1>
        <p className="subtitle">
          Register with your CNIC, browse the candidates on the ballot, and
          cast one vote. Results update as soon as votes are counted.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/signup" className="btn btn-primary">
            Register to vote
          </Link>
          <Link href="/login" className="btn btn-outline">
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  );
}
