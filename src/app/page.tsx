import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Control Plane</h1>
      <p><Link href="/login">Go to Login</Link></p>
    </div>
  );
}
