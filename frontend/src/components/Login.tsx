"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type Props = { open: boolean; onClose: () => void }

export default function LoginModal({ open, onClose }: Props) {
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
            const res = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Credenciais inválidas");
            const token = data.token || data.access_token;
            localStorage.setItem("connect_token", token);
            if (data.user) localStorage.setItem("connect_user", JSON.stringify(data.user));
            onClose();
            router.push("/admin");
        } catch (err: any) {
            setError(err.message || "Erro ao entrar");
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={onClose} />
            {/* DESIGN IGUAL PRINT */}
            <div className="relative w-full sm:max-w-[480px] bg-white rounded-t-[32px] sm:rounded-[32px] border border-[#e2e8f0] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-[20px] font-semibold tracking-tight text-[#1e293b]">Acesso administrativo</h2>
                        <p className="text-[13px] text-[#64748b] mt-1">Connect.ao</p>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 rounded-full border border-[#e2e8f0] bg-[#f8fafc] grid place-items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                {error && (
                    <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 flex gap-2 text-[12px] text-red-700">
                        <span>!</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 grid gap-5">
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#475569] mb-2 block">Corporate Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@company.com"
                                disabled={loading}
                                className="w-full h-[46px] rounded-full border border-[#e2e8f0] bg-white px-5 pl-10 text-[14px] placeholder:text-[#94a3b8] focus:border-[#0e8ac2] focus:outline-none"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v16H4z"/><path d="M4 4l8 8 8-8"/></svg>
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#475569] mb-2 block">Inquiry Details</label>
                        <div className="relative">
                            <input
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Please detail your partnership interest or product inquiry..."
                                disabled={loading}
                                className="w-full h-[46px] rounded-full border border-[#e2e8f0] bg-white px-5 pl-10 pr-12 text-[14px] placeholder:text-[#94a3b8] focus:border-[#0e8ac2] focus:outline-none"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                            </span>
                            <button type="button" onClick={() => setShow(!show)} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border border-[#e2e8f0] grid place-items-center text-[#64748b] hover:text-black">
                                {show ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.88 9.88a3 3 0 104.24 4.24"/><path d="M10.73 5.08A10.94 10.94 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68"/><path d="M6.38 6.38A13.16 13.16 0 002 12s3 7 10 7a10.94 10.94 0 005.39-1.39"/><path d="M2 2l20 20"/></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full h-[46px] rounded-full bg-[#0e8ac2] text-white font-semibold text-[14px] shadow-[0_8px_20px_rgba(14,138,194,0.25)] hover:bg-[#0c709e] flex items-center justify-center disabled:opacity-50">
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    );
}
