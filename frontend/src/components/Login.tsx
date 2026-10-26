"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [email, setEmail] = useState("admin@connect.ao");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/api/v1/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Credenciais inválidas");
            localStorage.setItem("connect_token", data.token || data.access_token);
            if (data.user) localStorage.setItem("connect_user", JSON.stringify(data.user));
            onClose();
            router.push("/admin");
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-75 rounded-3xl border bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold tracking-tight">Login</h2>
                    <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border bg-[#f8fafc] text-xs">✕</button>
                </div>

                {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{error}</div>}

                <form onSubmit={handleLogin} className="mt-4 grid gap-2.5">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="h-10 w-full rounded-full border border-[#e2e8f0] px-4 text-sm outline-none focus:border-[#0e8ac2]"
                    />

                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="h-10 w-full rounded-full border border-[#e2e8f0] px-4 pr-10 text-sm outline-none focus:border-[#0e8ac2]"
                        />
                        <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-white text-[#64748b]">
                            {show ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a17.2 17.2 0 0 1-3.16 4.19"/><path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/><path d="M2.39 8.27A17.2 17.2 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.39-1.33"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="mt-1 flex h-10 w-full items-center justify-center rounded-full bg-[#0e8ac2] text-sm font-semibold text-white disabled:opacity-50">
                        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
