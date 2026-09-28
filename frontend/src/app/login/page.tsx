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

    return (
        <div className="min-h-screen flex bg-zinc-950 text-white">
            <div className="hidden lg:flex w-1/2 bg-linear-to-br from-violet-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl grid place-items-center overflow-hidden">
                        <Image src="/logo.png" alt="Connect" width={40} height={40} className="object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-widest">CONNECT.AO</span>
                </div>
                <div>
                    <h1 className="text-5xl font-bold leading-tight mb-4">Conecte<br />Angola ao<br />futuro.</h1>
                    <p className="text-white/70 text-lg">Hub central de notícias, empresas e oportunidades.</p>
                </div>
                <div className="text-sm text-white/50">© 2026 Connect.ao</div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 bg-white text-zinc-900 lg:bg-zinc-950 lg:text-white">
                <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <Image src="/logo.png" alt="Connect" width={40} height={40} className="rounded-xl" />
                        <span className="text-xl font-bold">CONNECT.AO</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Bem-vindo de volta</h2>
                        <p className="text-zinc-500 lg:text-zinc-400 mt-2">Entre com sua conta admin</p>
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-zinc-500">Email</label>
                            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@connect.ao" className="mt-1.5 w-full bg-zinc-50 lg:bg-zinc-900 border border-zinc-200 lg:border-zinc-800 rounded-xl px-4 py-3.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition" required />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-500">Senha</label>
                            <div className="mt-1.5 relative">
                                <input value={password} onChange={e => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" className="w-full bg-zinc-50 lg:bg-zinc-900 border border-zinc-200 lg:border-zinc-800 rounded-xl px-4 py-3.5 pr-12 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition" required />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 lg:hover:text-white text-sm">{show ? "Esconder" : "Ver"}</button>
                            </div>
                        </div>
                    </div>
                    <button disabled={loading} className="w-full bg-zinc-900 lg:bg-white text-white lg:text-black font-semibold rounded-xl py-3.5 hover:bg-black lg:hover:bg-zinc-200 disabled:opacity-50 transition flex justify-center items-center gap-2">
                        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white lg:border-black/30 lg:border-t-black rounded-full animate-spin" /> : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
