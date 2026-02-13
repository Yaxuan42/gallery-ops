"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("邮箱或密码错误");
      }
    } catch {
      setError("登录失败，请重试");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-[#e8eaed] bg-white p-8"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-[#202124]">Gallery Admin</h1>
        {error && <p className="mb-4 text-center text-sm text-red-600">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-[#e8eaed] px-3 py-2 text-sm focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 focus:outline-none"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-[#e8eaed] px-3 py-2 text-sm focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#1a73e8] py-2 text-sm font-medium text-white hover:bg-[#1557b0] disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      </form>
    </div>
  );
}
