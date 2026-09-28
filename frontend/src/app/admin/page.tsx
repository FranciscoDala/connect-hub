"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { API_URL, getToken, clearAuth } from "../../lib/api";

function authHeader() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

type Category = { id: string; nome: string; slug: string; cor?: string };
type Post = any;

export default function AdminPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [cats, setCats] = useState<Category[]>([]);
    const [filter, setFilter] = useState("");
    const router = useRouter();
    const [showPostModal, setShowPostModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [form, setForm] = useState({
        titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "",
        category_id: "", status: "published", destaque: false, tags: "",
        media_url: "", thumbnail_url: ""
    });
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [catForm, setCatForm] = useState({ nome: "", slug: "", descricao: "", cor: "#7c3aed" });

    useEffect(() => {
        if (!getToken()) { router.replace("/admin/login"); return; }
        loadAll();
    }, []);

    async function loadAll() {
        try {
            const [pRes, cRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/posts`, { headers: authHeader() as any }),
                fetch(`${API_URL}/api/v1/categories`, { headers: authHeader() as any })
            ]);
            if (pRes.status === 401 || cRes.status === 401) throw new Error("401");
            setPosts(await pRes.json());
            setCats(await cRes.json());
        } catch { clearAuth(); router.replace("/admin/login"); }
    }

    function openNewPost() {
        setEditingPost(null);
        setForm({ titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "" });
        setFiles(null);
        setShowPostModal(true);
    }
    function openEditPost(p: Post) {
        setEditingPost(p);
        setForm({
            titulo: p.titulo, slug: p.slug || "", tipo: p.tipo, descricao: p.descricao || "", conteudo: p.conteudo || "",
            category_id: p.category_id || "", status: p.status, destaque: p.destaque, tags: (p.tags || []).join(", "), media_url: p.media_url || "", thumbnail_url: p.thumbnail_url || ""
        });
        setShowPostModal(true);
    }

    async function savePost() {
        if (!form.titulo) return toast.error("Título obrigatório");
        setLoading(true);
        try {
            let media_url = form.media_url;
            let thumbnail_url = form.thumbnail_url;
            let media_files = null;
            let media_type = null;
            if (files && files.length > 0) {
                const uploaded: any[] = [];
                for (let i = 0; i < files.length; i++) {
                    const fd = new FormData(); fd.append("file", files[i]);
                    const up = await fetch(`${API_URL}/api/v1/upload`, { method: "POST", headers: authHeader() as any, body: fd });
                    const d = await up.json();
                    uploaded.push(d);
                }
                media_files = uploaded;
                media_url = uploaded[0]?.url || media_url;
                media_type = uploaded[0]?.type || form.tipo;
                thumbnail_url = uploaded[0]?.url || thumbnail_url;
            }
            const payload = {
                titulo: form.titulo,
                slug: form.slug || form.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                tipo: form.tipo,
                descricao: form.descricao,
                conteudo: form.conteudo,
                category_id: form.category_id || null,
                status: form.status,
                destaque: form.destaque,
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                media_url, thumbnail_url, media_type, media_files,
            };
            const method = editingPost ? "PUT" : "POST";
            const url = editingPost ? `${API_URL}/api/v1/posts/${editingPost.id}` : `${API_URL}/api/v1/posts`;
            const res = await fetch(url, { method, body: JSON.stringify(payload), headers: { "Content-Type": "application/json", ...authHeader() } as any });
            if (!res.ok) { const e = await res.text(); throw new Error(e); }
            toast.success(editingPost ? "Atualizado!" : "Criado!");
            setShowPostModal(false);
            loadAll();
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    }

    async function deletePost(id: string) {
        if (!confirm("Apagar post?")) return;
        await fetch(`${API_URL}/api/v1/posts/${id}`, { method: "DELETE", headers: authHeader() as any });
        setPosts(posts.filter(p => p.id !== id));
        toast.success("Apagado");
    }

    function openNewCat() { setEditingCat(null); setCatForm({ nome: "", slug: "", descricao: "", cor: "#7c3aed" }); setShowCatModal(true); }
    function openEditCat(c: Category) { setEditingCat(c as any); setCatForm({ nome: c.nome, slug: c.slug, descricao: (c as any).descricao || "", cor: (c as any).cor || "#7c3aed" }); setShowCatModal(true); }
    async function saveCat() {
        const method = editingCat ? "PUT" : "POST";
        const url = editingCat ? `${API_URL}/api/v1/categories/${editingCat.id}` : `${API_URL}/api/v1/categories`;
        const res = await fetch(url, { method, body: JSON.stringify({ ...catForm, slug: catForm.slug || catForm.nome.toLowerCase().replace(/\s+/g, "-") }), headers: { "Content-Type": "application/json", ...authHeader() } as any });
        if (!res.ok) return toast.error("Erro categoria");
        setShowCatModal(false); loadAll(); toast.success("Categoria salva!");
    }
    async function deleteCat(id: string) {
        if (!confirm("Apagar categoria?")) return;
        await fetch(`${API_URL}/api/v1/categories/${id}`, { method: "DELETE", headers: authHeader() as any });
        loadAll();
    }

    const filtered = posts.filter(p => p.titulo.toLowerCase().includes(filter.toLowerCase()));

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-900">
            <Toaster richColors position="top-center" />
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-zinc-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
                    <h1 className="text-[11px] font-bold tracking-[0.2em]">ADMIN • CONNECT.AO</h1>
                    <div className="flex gap-2">
                        <button onClick={openNewCat} className="text-xs px-4 py-2 rounded-full border border-zinc-200 hover:bg-zinc-50">+ CATEGORIA</button>
                        <button onClick={openNewPost} className="text-xs px-4 py-2 rounded-full bg-zinc-900 text-white hover:bg-black">+ NOVO POST</button>
                        <button onClick={() => { clearAuth(); router.replace("/admin/login"); }} className="text-xs px-3 py-2 rounded-full text-zinc-400">SAIR</button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {cats.map(c => (
                        <div key={c.id} className="group flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white text-xs shrink-0">
                            <span className="w-2 h-2 rounded-full" style={{ background: (c as any).cor || "#7c3aed" }} />
                            {c.nome}
                            <button onClick={() => openEditCat(c)} className="opacity-0 group-hover:opacity-100 ml-1">✎</button>
                            <button onClick={() => deleteCat(c.id)} className="opacity-0 group-hover:opacity-100 text-red-400">×</button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold">Posts • {filtered.length}</h2>
                    <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..." className="px-4 py-2 rounded-full border text-sm w-64 outline-none focus:border-zinc-900" />
                </div>

                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden">
                    <div className="grid grid-cols-12 text-[10px] tracking-widest text-zinc-400 px-6 py-3 border-b bg-zinc-50/50">
                        <div className="col-span-6">TÍTULO</div><div className="col-span-2">CATEGORIA</div><div className="col-span-2">STATUS</div><div className="col-span-2 text-right">AÇÕES</div>
                    </div>
                    {filtered.map(p => (
                        <div key={p.id} className="grid grid-cols-12 items-center px-6 py-4 border-b last:border-0 hover:bg-zinc-50/70 transition">
                            <div className="col-span-6 flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0">{p.thumbnail_url || p.media_url ? <img src={p.media_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full grid place-items-center text-[10px]">{p.tipo[0].toUpperCase()}</div>}</div>
                                <div><p className="text-sm font-medium line-clamp-1">{p.titulo}</p><p className="text-xs text-zinc-500">{p.tipo} • {new Date(p.created_at).toLocaleDateString()}</p></div>
                            </div>
                            <div className="col-span-2"><span className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">{cats.find(c => c.id === p.category_id)?.nome || "—"}</span></div>
                            <div className="col-span-2 flex gap-1"><span className={`text-[10px] px-2 py-1 rounded-full border ${p.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100'}`}>{p.status}</span>{p.destaque && <span className="text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">DESTAQUE</span>}</div>
                            <div className="col-span-2 flex justify-end gap-1">
                                <button onClick={() => openEditPost(p)} className="w-8 h-8 rounded-full border hover:bg-white grid place-items-center">✎</button>
                                <button onClick={() => deletePost(p.id)} className="w-8 h-8 rounded-full border hover:bg-red-50 hover:text-red-500 grid place-items-center">🗑</button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="p-12 text-center text-sm text-zinc-400">Nenhum post encontrado</div>}
                </div>
            </div>

            {showPostModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">{editingPost ? "Editar Post" : "Novo Post"}</h3><button onClick={() => setShowPostModal(false)} className="w-8 h-8 rounded-full bg-zinc-100">×</button></div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="text-xs text-zinc-500">Título *</label><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50 outline-none focus:bg-white focus:border-zinc-900" /></div>
                            <div><label className="text-xs text-zinc-500">Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto" className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50" /></div>
                            <div><label className="text-xs text-zinc-500">Categoria</label><select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50"><option value="">Sem categoria</option>{cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                            <div><label className="text-xs text-zinc-500">Tipo</label><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50"><option value="noticia">Notícia</option><option value="video">Vídeo</option><option value="imagem">Imagem</option><option value="audio">Áudio</option><option value="pdf">PDF</option></select></div>
                            <div><label className="text-xs text-zinc-500">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50"><option value="published">Publicado</option><option value="draft">Rascunho</option><option value="archived">Arquivado</option></select></div>
                            <div className="md:col-span-2"><label className="text-xs text-zinc-500">Descrição curta</label><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50" /></div>
                            <div className="md:col-span-2"><label className="text-xs text-zinc-500">Conteúdo completo</label><textarea value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} rows={6} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50" placeholder="HTML ou texto..." /></div>
                            <div><label className="text-xs text-zinc-500">Tags (separadas por vírgula)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="politica, luanda, destaque" className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50" /></div>
                            <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={form.destaque} onChange={e => setForm({ ...form, destaque: e.target.checked })} /><label className="text-sm">Destaque?</label></div>
                            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                                <div><label className="text-xs text-zinc-500">Media URL (opcional)</label><input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50" /></div>
                                <div><label className="text-xs text-zinc-500">Thumbnail URL</label><input value={form.thumbnail_url} onChange={e => setForm({ ...form, thumbnail_url: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border bg-zinc-50" /></div>
                            </div>
                            <div className="md:col-span-2"><label className="text-xs text-zinc-500">Upload arquivos (vai para media_files JSONB)</label><input type="file" multiple accept="image/*,video/*,audio/*,.pdf" onChange={e => setFiles(e.target.files)} className="w-full mt-1 file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-zinc-900 file:text-white" /></div>
                        </div>
                        <button onClick={savePost} disabled={loading} className="w-full mt-6 py-3.5 rounded-full bg-zinc-900 text-white font-bold text-xs tracking-widest hover:bg-black disabled:opacity-50">{loading ? "SALVANDO..." : editingPost ? "ATUALIZAR" : "CRIAR POST"}</button>
                    </div>
                </div>
            )}

            {showCatModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold">{editingCat ? "Editar Categoria" : "Nova Categoria"}</h3><button onClick={() => setShowCatModal(false)} className="w-8 h-8 rounded-full bg-zinc-100">×</button></div>
                        <div className="space-y-3">
                            <input value={catForm.nome} onChange={e => setCatForm({ ...catForm, nome: e.target.value })} placeholder="Nome ex: Política" className="w-full px-4 py-3 rounded-xl border bg-zinc-50" />
                            <input value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} placeholder="Slug ex: politica" className="w-full px-4 py-3 rounded-xl border bg-zinc-50" />
                            <input value={catForm.descricao} onChange={e => setCatForm({ ...catForm, descricao: e.target.value })} placeholder="Descrição" className="w-full px-4 py-3 rounded-xl border bg-zinc-50" />
                            <div className="flex items-center gap-3"><input type="color" value={catForm.cor} onChange={e => setCatForm({ ...catForm, cor: e.target.value })} className="w-10 h-10 rounded-xl" /><span className="text-sm">Cor da categoria</span></div>
                        </div>
                        <button onClick={saveCat} className="w-full mt-6 py-3 rounded-full bg-violet-600 text-white font-bold text-xs tracking-widest">SALVAR</button>
                    </div>
                </div>
            )}
        </main>
    );
}
