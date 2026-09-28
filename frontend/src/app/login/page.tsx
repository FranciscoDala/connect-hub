"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { API_URL, getToken } from "../../lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("admin@connect.ao");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (getToken()) router.replace("/admin");
    }, [router]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!email ||!password) return toast.error("Preenche email e senha");
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: { "Content-Type": "application/json" },
                cache: "no-store"
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Credenciais inválidas");

            localStorage.setItem("connect_token", data.token);
            localStorage.setItem("connect_user", JSON.stringify({ email: data.email, role: data.role }));
            toast.success("Login feito!");
            router.replace("/admin");
        } catch (err: any) {
            toast.error(err.message);
        } finally { setLoading(false); }
    }

    return (
        <main className="min-h-screen bg-zinc-50 grid place-items-center px-4">
            <Toaster richColors position="top-center" />
            <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <h1 className="text-center text-sm font-bold tracking-widest">ADMIN LOGIN</h1>
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="Senha" className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white" />
                    <button disabled={loading} className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-widest hover:bg-black disabled:opacity-50 transition">
                        {loading? "ENTRANDO..." : "ENTRAR"}
                    </button>
                </form>
            </div>
        </main>
    )
}
