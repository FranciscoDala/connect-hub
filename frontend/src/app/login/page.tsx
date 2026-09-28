"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("admin@connect.ao");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: any) {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
            router.push("/admin");
        } else {
            alert(data.error || "Erro no login");
        }
    }

    return (
        <main className="min-h-screen bg-zinc-50 grid place-items-center px-4">
            <div className="w-full max-w-90 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <img src="/connect.png" alt="CONNECT" className="h-6 mx-auto mb-6" />
                <h1 className="text-center text-sm font-bold tracking-widest">ADMIN LOGIN</h1>
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm outline-none focus:border-zinc-900" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Senha" className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm outline-none focus:border-zinc-900" />
                    <button disabled={loading} className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-[11px] font-bold tracking-widest hover:bg-black transition">
                        {loading ? "ENTRANDO..." : "ENTRAR"}
                    </button>
                    <p className="text-[10px] text-center text-zinc-500 mt-2">Padrão: admin@connect.ao / admin123</p>
                </form>
            </div>
        </main>
    )
}
