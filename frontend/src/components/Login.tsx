"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [email, setEmail] = useState("email@connect.ao");
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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-90 overflow-hidden rounded-4xl border border-white bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-[#eaf2ff] px-5 py-4">
                    <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white shadow-sm">
                        <img
                            src="/favicon-32x32.png"
                            alt="CONNECT"
                            className="h-7 w-7 object-contain"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0a84ff] shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-[#0a84ff]"></span> Login
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">CONNECT</h2>
                    <p className="mt-1 text-sm text-slate-500">Acesso restrito para o admin</p>

                    {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{error}</div>}

                    <form onSubmit={handleLogin} className="mt-4 grid gap-3">
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M7 7V5a2 2 0 0 1 2-2h2" /><path d="M8 11h8" /><path d="M8 15h5" /></svg>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="email@connect.ao"
                                className="h-11.5 w-full rounded-xl border border-slate-200 bg-[#eef5ff] pl-10 pr-4 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#0a84ff] focus:bg-white"
                            />
                        </div>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V8a5 5 0 0 1 10 0v3" /></svg>
                            </span>
                            <input
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••••••"
                                className="h-11.5 w-full rounded-xl border border-slate-200 bg-[#eef5ff] pl-10 pr-10 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0a84ff] focus:bg-white"
                            />
                            <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1 grid h-9.5 w-8 place-items-center text-slate-400">
                                {show ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a17.2 17.2 0 0 1-3.16 4.19" /><path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" /><path d="M2.39 8.27A17.2 17.2 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.39-1.33" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                                )}
                            </button>
                        </div>

                        <button type="submit" disabled={loading} className="mt-1 flex h-11.5 w-full items-center justify-center rounded-full bg-[#0a84ff] text-sm font-semibold text-white shadow-lg shadow-blue-500/30 disabled:opacity-50">
                            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <span className="text-lg">Acessar</span>}
                        </button>
                    </form>

                    <button onClick={onClose} className="absolute right-3 top-17.5 grid h-7 w-7 place-items-center rounded-full border bg-white text-xs text-slate-500 md:hidden">✕</button>
                </div>
            </div>
        </div>
    );
}
