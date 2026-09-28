"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [titulo, setTitulo] = useState("");
    const [tipo, setTipo] = useState("noticia");
    const [descricao, setDescricao] = useState("");

    useEffect(() => {
        fetch("/api/posts").then(r => r.json()).then(setPosts);
    }, []);

    async function criarPost() {
        if (!titulo) return alert("Título obrigatório");
        const res = await fetch("/api/posts", {
            method: "POST",
            body: JSON.stringify({ titulo, tipo, descricao }),
            headers: { "Content-Type": "application/json" }
        });
        const novo = await res.json();
        setPosts([novo, ...posts]);
        setTitulo(""); setDescricao("");
    }

    async function deletar(id: string) {
        await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
        setPosts(posts.filter(p => p.id !== id));
    }

    return (
        <main className="min-h-screen bg-white">
            <header className="max-w-6xl mx-auto flex justify-between items-center py-5 px-4 border-b border-zinc-100">
                <h1 className="text-[11px] font-bold tracking-[0.2em]">ADMIN • CONNECT</h1>
                <a href="/api/auth/logout" className="text-[10px] tracking-widest border border-zinc-200 px-4 py-1.5 rounded-full">SAIR</a>
            </header>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-12 gap-8 py-8">
                <div className="col-span-12 md:col-span-5 bg-zinc-50 border border-zinc-200 rounded-3xl p-6 h-fit">
                    <h2 className="text-sm font-bold mb-4">Novo Post</h2>
                    <div className="space-y-3">
                        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm bg-white" />
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full px-4 py-2.5 rounded-full border border-zinc-200 text-sm bg-white">
                            <option value="noticia">Notícia</option>
                            <option value="case">Case</option>
                            <option value="servico">Serviço</option>
                        </select>
                        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" rows={4} className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm bg-white" />
                        <button onClick={criarPost} className="w-full py-2.5 rounded-full bg-zinc-900 text-white text-[11px] font-bold tracking-widest">CRIAR POST</button>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-7">
                    <h2 className="text-sm font-bold mb-4">Posts ({posts.length})</h2>
                    <div className="space-y-3">
                        {posts.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-4 rounded-2xl border border-zinc-200">
                                <div>
                                    <p className="text-[10px] uppercase text-violet-600 font-bold">{p.tipo}</p>
                                    <p className="text-sm font-medium">{p.titulo}</p>
                                </div>
                                <button onClick={() => deletar(p.id)} className="text-[10px] text-red-500 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50">DELETAR</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
