import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// next/font/google downloads and self-hosts the font at build time -
// no request to Google at runtime, and no layout shift.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-source-serif",
});

export const metadata = {
  title: "Ballot Box - Voting App",
  description: "Cast your vote securely.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        {/* AuthProvider wraps EVERYTHING so any page can call useAuth() */}
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
