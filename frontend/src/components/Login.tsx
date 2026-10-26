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
        <div className="fixed inset-0 z-90 flex items-end justify-center p-0 sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full bg-white rounded-t-4xl border shadow-2xl sm:max-w-lg sm:rounded-3xl p-7">
                <div className="mb-2 flex items-start justify-between">
                    <div><h2 className="text-xl font-semibold tracking-tight">Acesso administrativo</h2><p className="mt-1 text-sm text-[#64748b]">Connect.ao</p></div>
                    <button onClick={onClose} className="h-9 w-9 rounded-full border bg-[#f8fafc] grid place-items-center">✕</button>
                </div>
                {error && <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
                <form onSubmit={handleLogin} className="mt-6 grid gap-5">
                    <div><label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#475569]">Corporate Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 w-full rounded-full border border-[#e2e8f0] px-5 text-sm outline-none focus:border-[#0e8ac2]" /></div>
                    <div><label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#475569]">Password</label><div className="relative"><input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required className="h-11 w-full rounded-full border border-[#e2e8f0] px-5 pr-11 text-sm outline-none focus:border-[#0e8ac2]" /><button type="button" onClick={() => setShow(!show)} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border bg-white text-xs">{show ? "—" : "O"}</button></div></div>
                    <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center rounded-full bg-[#0e8ac2] text-sm font-semibold text-white disabled:opacity-50">{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "Entrar"}</button>
                </form>
            </div>
        </div>
    );
}
