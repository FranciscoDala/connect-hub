"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { API_URL, getToken, clearAuth } from "../../lib/api";

function authHeader() {
    const t = getToken();
    return t? { Authorization: `Bearer ${t}` } : {};
}

export default function AdminPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [titulo, setTitulo] = useState("");
    const [tipo, setTipo] = useState("noticia");
    const [descricao, setDescricao] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!getToken()) { router.replace("/admin/login"); return; }
        fetch(`${API_URL}/api/v1/posts`, { headers: authHeader() as any })
           .then(r => { if (r.status === 401) throw new Error("401"); return r.json(); })
           .then(setPosts)
           .catch(() => { clearAuth(); router.replace("/admin/login"); });
    }, [router]);

    async function criarPost() {
        if (!titulo) return toast.error("Título obrigatório");
        setLoading(true);
        try {
            let media_url = null, media_type = null;
            if (file) {
                const fd = new FormData();
                fd.append("file", file);
                const up = await fetch(`${API_URL}/api/v1/upload`, { method: "POST", headers: authHeader() as any, body: fd });
                if (!up.ok) throw new Error("Falha no upload");
                const upData = await up.json();
                media_url = upData.url;
                media_type = upData.type;
            }

            const res = await fetch(`${API_URL}/api/v1/posts`, {
                method: "POST",
                body: JSON.stringify({ titulo, tipo, descricao, media_url, media_type, status: "published" }),
                headers: { "Content-Type": "application/json",...authHeader() } as any
            });
            if (!res.ok) throw new Error("Erro ao criar");
            const novo = await res.json();
            setPosts([novo,...posts]);
            setTitulo(""); setDescricao(""); setFile(null);
            toast.success("Post criado!");
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    }

    function logout() { clearAuth(); router.replace("/admin/login"); }

    return (
        <main className="min-h-screen bg-white">
            <Toaster richColors position="top-center" />
            <header className="max-w-6xl mx-auto flex justify-between items-center py-5 px-4 border-b border-zinc-100">
                <h1 className="text-xs font-bold tracking-widest">ADMIN • CONNECT</h1>
                <button onClick={logout} className="text-xs tracking-widest border border-zinc-200 px-4 py-1.5 rounded-full hover:bg-zinc-50">SAIR</button>
            </header>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-12 gap-8 py-8">
                <div className="col-span-12 md:col-span-5 bg-zinc-50 border border-zinc-200 rounded-3xl p-6 h-fit">
                    <h2 className="text-sm font-bold mb-4">Novo Post</h2>
                    <div className="space-y-3">
                        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm bg-white outline-none focus:border-zinc-900" />
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm bg-white outline-none">
                            <option value="noticia">Notícia</option>
                            <option value="video">Vídeo</option>
                            <option value="imagem">Imagem</option>
                            <option value="audio">Áudio</option>
                        </select>
                        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" rows={4} className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm bg-white outline-none focus:border-zinc-900 resize-none" />
                        <input type="file" accept="image/*,video/*,audio/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:px-4 file:py-1.5 file:rounded-full file:border-0 file:bg-zinc-900 file:text-white file:text-xs" />
                        <button onClick={criarPost} disabled={loading} className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-widest hover:bg-black disabled:opacity-50">
                            {loading? "CRIANDO..." : "CRIAR POST"}
                        </button>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-7">
                    <h2 className="text-sm font-bold mb-4">Posts ({posts.length})</h2>
                    <div className="space-y-3">
                        {posts.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-4 rounded-2xl border border-zinc-200 bg-white">
                                <div>
                                    <p className="text-xs uppercase text-violet-600 font-bold tracking-widest">{p.tipo}</p>
                                    <p className="text-sm font-medium mt-0.5">{p.titulo}</p>
                                </div>
                                <span className="text-xs text-zinc-400">{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
