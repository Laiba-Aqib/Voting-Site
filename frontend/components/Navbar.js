"use client";

// components/Navbar.js
//
// Shows different links depending on whether someone is logged in,
// and whether they're an admin. It reads that from useAuth(), which
// in turn got it from GET /user/profile (see context/AuthContext.js).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          Ballot Box
        </Link>
        <nav className="nav-links">
          {!loading && user && (
            <>
              <Link href="/candidates">Candidates</Link>
              <Link href="/results">Results</Link>
              <Link href="/profile">Profile</Link>
              {user.role === "admin" && <Link href="/admin">Admin</Link>}
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="btn btn-primary">
                Register to vote
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
