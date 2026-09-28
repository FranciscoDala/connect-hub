"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import Image from "next/image";

export default function Login() {
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
            router.push("/admin");
        } catch (err: any) {
            setError(err.message || "Erro ao entrar");
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition";

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="relative w-full max-w-100 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                {/* Header igual FT-Xpress */}
                <div className="relative h-18 px-5 pt-5 flex justify-between items-start bg-blue-50">
                    <div className="w-9 h-9 rounded-full bg-white border shadow-sm flex items-center justify-center overflow-hidden">
                        <Image src="/connect.png" alt="Connect.ao" width={28} height={28} className="object-contain" />
                    </div>
                    <div className="h-7 px-3 rounded-full bg-white border border-blue-200 shadow-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-xs font-semibold text-blue-600 tracking-wide">Login</span>
                    </div>
                </div>

                <div className="px-6 pt-4">
                    <h1 className="text-lg font-bold text-gray-900">Connect.ao</h1>
                    <p className="text-sm text-gray-500 mt-1">Acesso administrativo</p>
                </div>

                {error && (
                    <div className="mx-6 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex gap-2.5 items-start">
                        <span className="text-red-600 text-sm">⚠</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">Erro no login</p>
                            <p className="text-xs text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="px-6 pb-6 pt-4 flex flex-col gap-2">
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`${inputClass} pl-10`}
                            placeholder="admin@connect.ao"
                            disabled={loading}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    </div>

                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`${inputClass} pl-10 pr-10`}
                            placeholder="Senha"
                            disabled={loading}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-xs text-gray-500">
                            {show ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <div className="mt-2">
                        <button type="submit" disabled={loading} className="w-full h-11 rounded-full bg-black text-white font-semibold hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50 transition">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="flex items-center gap-1">Entrar <span>→</span></span>}
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-3">
                        © 2026 Connect.ao • Admin
                    </p>
                </form>
            </div>
        </div>
    );
}
