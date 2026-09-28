"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { API_URL, getToken, clearAuth, authHeader } from "../../lib/api";

type Category = { id: string; nome: string; slug: string; cor?: string; descricao?: string };
type Post = any;
type Tab = 'conteudo' | 'midia' | 'config';
type BannerPos = 'home_topo' | 'home_meio' | 'sidebar' | 'dentro_post' | 'footer';
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: BannerPos; ativo: boolean; clicks?: number; views?: number; data_inicio?: string; data_fim?: string };

const TIPOS = [
    { value: 'noticia', label: 'Notícia' },
    { value: 'video', label: 'Vídeo' },
    { value: 'imagem', label: 'Imagem' },
    { value: 'audio', label: 'Áudio' },
    { value: 'pdf', label: 'PDF' },
];
const STATUS = [
    { value: 'published', label: 'Publicado' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'archived', label: 'Arquivado' },
];
const POSICOES: { value: BannerPos, label: string }[] = [
    { value: 'home_topo', label: 'Home Topo' },
    { value: 'home_meio', label: 'Home Meio' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'dentro_post', label: 'Dentro do Post' },
    { value: 'footer', label: 'Footer' },
];

function CustomSelect({ value, options, onChange, placeholder }: { value: string, options: { value: string, label: string }[], onChange: (v: string) => void, placeholder: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current &&!ref.current.contains(e.target as Node)) setOpen(false) };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const selected = options.find(o => o.value === value);
    return (
        <div ref={ref} className="relative w-full">
            <button type="button" onClick={() => setOpen(!open)} className={`w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm text-black flex items-center justify-between focus:outline-none focus:border-black transition ${open? 'border-black ring-2 ring-black/10' : ''}`}>
                <span className={`truncate ${selected? 'text-black font-medium' : 'text-black/40'}`}>{selected? selected.label : placeholder}</span>
                <span className={`text-gray-400 transition-transform shrink-0 text-xs ${open? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open && (
                <div className="absolute z-60 top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-1.5 max-h-[220px] overflow-y-auto scrollbar-none">
                    {options.map(o => (
                        <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${value === o.value? 'bg-blue-50 font-semibold text-black' : 'hover:bg-gray-50 text-gray-700'}`}>
                            {o.label} {value === o.value && <span>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [cats, setCats] = useState<Category[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [filter, setFilter] = useState("");
    const [mainTab, setMainTab] = useState<'posts'|'banners'>('posts');
    const router = useRouter();
    const [showPostModal, setShowPostModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [tab, setTab] = useState<Tab>('conteudo');
    const [form, setForm] = useState({ titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "" });
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [catForm, setCatForm] = useState({ nome: "", slug: "", descricao: "", cor: "#7c3aed" });
    const [bannerForm, setBannerForm] = useState({ titulo: "", imagem_url: "", link_url: "", posicao: "home_topo" as BannerPos, ativo: true, data_inicio: "", data_fim: "" });
    const [bannerFile, setBannerFile] = useState<FileList | null>(null);

    useEffect(() => { if (!getToken()) { router.replace("/login"); return; } loadAll(); }, []);
    async function loadAll() {
        try {
            const [pRes, cRes, bRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/posts`, { headers: authHeader() as any }),
                fetch(`${API_URL}/api/v1/categories`, { headers: authHeader() as any }),
                fetch(`${API_URL}/api/v1/banners`, { headers: authHeader() as any }).catch(()=>({ json: async()=>[] } as any))
            ]);
            if (pRes.status === 401 || cRes.status === 401) throw new Error("401");
            setPosts(await pRes.json());
            setCats(await cRes.json());
            try{ setBanners(await (bRes as any).json()); }catch{ setBanners([]); }
        } catch { clearAuth(); router.replace("/login"); }
    }

    function openNewPost() { setEditingPost(null); setForm({ titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "" }); setFiles(null); setTab('conteudo'); setShowPostModal(true); }
    function openEditPost(p: Post) { setEditingPost(p); setForm({ titulo: p.titulo, slug: p.slug || "", tipo: p.tipo, descricao: p.descricao || "", conteudo: p.conteudo || "", category_id: p.category_id || "", status: p.status, destaque: p.destaque, tags: (p.tags || []).join(", "), media_url: p.media_url || "", thumbnail_url: p.thumbnail_url || "" }); setTab('conteudo'); setShowPostModal(true); }
    async function savePost() {
        if (!form.titulo) return toast.error("Título obrigatório");
        setLoading(true);
        try {
            let media_url = form.media_url; let thumbnail_url = form.thumbnail_url; let media_files = null; let media_type = null;
            if (files && files.length > 0) {
                const uploaded: any[] = [];
                for (let i = 0; i < files.length; i++) { const fd = new FormData(); fd.append("file", files[i]); const up = await fetch(`${API_URL}/api/v1/upload`, { method: "POST", headers: authHeader() as any, body: fd }); const d = await up.json(); uploaded.push(d); }
                media_files = uploaded; media_url = uploaded[0]?.url || media_url; media_type = uploaded[0]?.type || form.tipo; thumbnail_url = uploaded[0]?.url || thumbnail_url;
            }
            const payload = { titulo: form.titulo, slug: form.slug || form.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-"), tipo: form.tipo, descricao: form.descricao, conteudo: form.conteudo, category_id: form.category_id || null, status: form.status, destaque: form.destaque, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), media_url, thumbnail_url, media_type, media_files };
            const method = editingPost? "PUT" : "POST"; const url = editingPost? `${API_URL}/api/v1/posts/${editingPost.id}` : `${API_URL}/api/v1/posts`;
            const res = await fetch(url, { method, body: JSON.stringify(payload), headers: { "Content-Type": "application/json",...authHeader() } as any });
            if (!res.ok) { const e = await res.text(); throw new Error(e); }
            toast.success(editingPost? "Atualizado!" : "Criado!"); setShowPostModal(false); loadAll();
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }
    async function deletePost(id: string) { if (!confirm("Apagar post?")) return; await fetch(`${API_URL}/api/v1/posts/${id}`, { method: "DELETE", headers: authHeader() as any }); setPosts(posts.filter(p => p.id!== id)); toast.success("Apagado"); }
    function openNewCat() { setEditingCat(null); setCatForm({ nome: "", slug: "", descricao: "", cor: "#7c3aed" }); setShowCatModal(true); }
    function openEditCat(c: Category) { setEditingCat(c as any); setCatForm({ nome: c.nome, slug: c.slug, descricao: (c as any).descricao || "", cor: (c as any).cor || "#7c3aed" }); setShowCatModal(true); }
    async function saveCat() { const method = editingCat? "PUT" : "POST"; const url = editingCat? `${API_URL}/api/v1/categories/${editingCat.id}` : `${API_URL}/api/v1/categories`; const res = await fetch(url, { method, body: JSON.stringify({...catForm, slug: catForm.slug || catForm.nome.toLowerCase().replace(/\s+/g, "-") }), headers: { "Content-Type": "application/json",...authHeader() } as any }); if (!res.ok) return toast.error("Erro categoria"); setShowCatModal(false); loadAll(); toast.success("Categoria salva!"); }
    async function deleteCat(id: string) { if (!confirm("Apagar categoria?")) return; await fetch(`${API_URL}/api/v1/categories/${id}`, { method: "DELETE", headers: authHeader() as any }); loadAll(); }

    // BANNERS CRUD
    function openNewBanner(){ setEditingBanner(null); setBannerForm({ titulo:"", imagem_url:"", link_url:"", posicao:"home_topo", ativo:true, data_inicio:"", data_fim:"" }); setBannerFile(null); setShowBannerModal(true); }
    function openEditBanner(b: Banner){ setEditingBanner(b); setBannerForm({ titulo:b.titulo, imagem_url:b.imagem_url, link_url:b.link_url||"", posicao:b.posicao, ativo:b.ativo, data_inicio:b.data_inicio||"", data_fim:b.data_fim||"" }); setShowBannerModal(true); }
    async function saveBanner(){
        if(!bannerForm.titulo) return toast.error("Título obrigatório");
        setLoading(true);
        try{
            let imagem_url = bannerForm.imagem_url;
            if(bannerFile && bannerFile.length>0){
                const fd = new FormData(); fd.append("file", bannerFile[0]);
                const up = await fetch(`${API_URL}/api/v1/upload`, { method:"POST", headers: authHeader() as any, body: fd });
                const d = await up.json(); imagem_url = d.url;
            }
            if(!imagem_url) return toast.error("Imagem obrigatória");
            const payload = {...bannerForm, imagem_url };
            const method = editingBanner? "PUT":"POST";
            const url = editingBanner? `${API_URL}/api/v1/banners/${editingBanner.id}` : `${API_URL}/api/v1/banners`;
            const res = await fetch(url, { method, body: JSON.stringify(payload), headers:{ "Content-Type":"application/json",...authHeader() } as any });
            if(!res.ok) throw new Error(await res.text());
            toast.success(editingBanner? "Banner atualizado!":"Banner criado!"); setShowBannerModal(false); loadAll();
        }catch(e:any){ toast.error(e.message); }finally{ setLoading(false); }
    }
    async function deleteBanner(id:string){ if(!confirm("Apagar banner?")) return; await fetch(`${API_URL}/api/v1/banners/${id}`, { method:"DELETE", headers: authHeader() as any }); setBanners(banners.filter(b=>b.id!==id)); toast.success("Apagado"); }

    const filtered = posts.filter(p => p.titulo.toLowerCase().includes(filter.toLowerCase()));
    const filteredBanners = banners.filter(b => b.titulo.toLowerCase().includes(filter.toLowerCase()));
    const inputClass = "w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition";
    const TabBtn = ({ id, label }: { id: Tab, label: string }) => (
        <button type="button" onClick={() => setTab(id)} className={`px-3.5 py-2 text-sm font-medium rounded-full transition border shrink-0 ${tab === id? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{label}</button>
    );

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-zinc-900 font-sans">
            <Toaster richColors position="top-center" />
            <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}`}</style>

            <header className="sticky top-0 z-20 bg-white border-b border-zinc-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 md:px-6">
                    <h1 className="text-[11px] font-bold tracking-[0.2em]">ADMIN • CONNECT.AO</h1>
                    <button onClick={() => { clearAuth(); router.replace("/login"); }} className="text-xs px-3 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition">SAIR</button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {cats.length > 0 && (
                    <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-2">
                        {cats.map(c => (
                            <div key={c.id} className="group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border bg-white text-[12px] shrink-0 shadow-sm">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: (c as any).cor || "#7c3aed" }} />
                                <span className="font-medium">{c.nome}</span>
                                <div className="flex items-center gap-0.5 ml-1">
                                    <button onClick={() => openEditCat(c)} className="w-6 h-6 rounded-full hover:bg-zinc-100 grid place-items-center">✎</button>
                                    <button onClick={() => deleteCat(c.id)} className="w-6 h-6 rounded-full hover:bg-red-50 text-zinc-400 hover:text-red-500 grid place-items-center">×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TABS PRINCIPAIS */}
                <div className="flex gap-2 mb-6">
                    <button onClick={()=>setMainTab('posts')} className={`h-9 px-5 rounded-full text-xs font-semibold border transition ${mainTab==='posts'?'bg-black text-white border-black':'bg-white border-zinc-200 hover:bg-zinc-50'}`}>POSTS • {posts.length}</button>
                    <button onClick={()=>setMainTab('banners')} className={`h-9 px-5 rounded-full text-xs font-semibold border transition ${mainTab==='banners'?'bg-black text-white border-black':'bg-white border-zinc-200 hover:bg-zinc-50'}`}>BANNERS • {banners.length}</button>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-sm font-semibold tracking-wide">{mainTab==='posts'?`Posts • ${filtered.length}`:`Banners • ${filteredBanners.length}`}</h2>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-[280px]">
                                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder={mainTab==='posts'?"Buscar post...":"Buscar banner..."} className="w-full h-10 pl-4 pr-4 rounded-full border border-zinc-200 bg-white text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10" />
                            </div>
                            <div className="flex gap-2">
                                {mainTab==='posts'?(
                                    <>
                                    <button onClick={openNewCat} className="flex-1 md:flex-none h-10 px-5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold transition">+ CATEGORIA</button>
                                    <button onClick={openNewPost} className="flex-1 md:flex-none h-10 px-5 rounded-full bg-zinc-900 text-white hover:bg-black text-xs font-semibold transition">+ NOVO POST</button>
                                    </>
                                ):(
                                    <button onClick={openNewBanner} className="flex-1 md:flex-none h-10 px-5 rounded-full bg-zinc-900 text-white hover:bg-black text-xs font-semibold transition">+ NOVO BANNER</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {mainTab==='posts'?(
                <div className="bg-white border border-zinc-200 rounded-[20px] overflow-hidden shadow-sm">
                    <div className="hidden md:grid grid-cols-12 text-[10px] tracking-widest text-zinc-400 px-6 py-3 border-b bg-zinc-50/50">
                        <div className="col-span-5">TÍTULO</div>
                        <div className="col-span-2">CATEGORIA</div>
                        <div className="col-span-1">STATUS</div>
                        <div className="col-span-2">MÉTRICAS</div>
                        <div className="col-span-2 text-right">AÇÕES</div>
                    </div>
                    {filtered.map(p => {
                        const views = p.views?? p.views_count?? 0;
                        const comments = p.comments_count?? 0;
                        const shares = p.shares?? p.shares_count?? 0;
                        return (
                        <div key={p.id} className="group border-b last:border-0 hover:bg-zinc-50/70 transition p-4 md:px-6 md:py-4 md:grid md:grid-cols-12 md:items-center gap-3">
                            <div className="col-span-5 flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                                    {p.thumbnail_url || p.media_url? <img src={p.media_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full grid place-items-center text-[10px] font-bold bg-zinc-900 text-white">{p.tipo[0].toUpperCase()}</div>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13.5px] font-semibold line-clamp-1 leading-tight">{p.titulo}</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">{p.tipo} • {new Date(p.created_at).toLocaleDateString()}</p>
                                    <div className="flex items-center gap-2 mt-2 md:hidden">
                                        <span className="flex items-center gap-1 text-[11px] bg-zinc-50 border px-2 py-0.5 rounded-full">👁 {views}</span>
                                        <span className="flex items-center gap-1 text-[11px] bg-zinc-50 border px-2 py-0.5 rounded-full">💬 {comments}</span>
                                        <span className="flex items-center gap-1 text-[11px] bg-zinc-50 border px-2 py-0.5 rounded-full">↗ {shares}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block col-span-2"><span className="text-[11px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 font-medium">{cats.find(c => c.id === p.category_id)?.nome || "—"}</span></div>
                            <div className="hidden md:flex col-span-1"><span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${p.status === 'published'? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-600'}`}>{p.status}</span></div>
                            <div className="hidden md:flex col-span-2 items-center gap-1.5 text-[11px] text-zinc-600">
                                <span className="flex items-center gap-1 bg-zinc-50 border px-2 py-1 rounded-full">👁 {views}</span>
                                <span className="flex items-center gap-1 bg-zinc-50 border px-2 py-1 rounded-full">💬 {comments}</span>
                                <span className="flex items-center gap-1 bg-zinc-50 border px-2 py-1 rounded-full">↗ {shares}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-3 md:mt-0 col-span-2">
                                <button onClick={() => openEditPost(p)} className="w-9 h-9 rounded-full bg-white border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white grid place-items-center transition">✎</button>
                                <button onClick={() => deletePost(p.id)} className="w-9 h-9 rounded-full bg-white border border-zinc-200 hover:border-red-500 hover:bg-red-500 hover:text-white grid place-items-center transition text-zinc-500">🗑</button>
                            </div>
                        </div>
                        )})}
                    {filtered.length === 0 && <div className="p-12 text-center text-sm text-zinc-400">Nenhum post encontrado</div>}
                </div>
                ):(
                <div className="bg-white border border-zinc-200 rounded-[20px] overflow-hidden shadow-sm">
                    <div className="hidden md:grid grid-cols-12 text-[10px] tracking-widest text-zinc-400 px-6 py-3 border-b bg-zinc-50/50">
                        <div className="col-span-5">BANNER</div>
                        <div className="col-span-2">POSIÇÃO</div>
                        <div className="col-span-1">STATUS</div>
                        <div className="col-span-2">MÉTRICAS</div>
                        <div className="col-span-2 text-right">AÇÕES</div>
                    </div>
                    {filteredBanners.map(b=>(
                        <div key={b.id} className="group border-b last:border-0 hover:bg-zinc-50/70 transition p-4 md:px-6 md:py-4 md:grid md:grid-cols-12 md:items-center gap-3">
                            <div className="col-span-5 flex gap-3 items-center">
                                <div className="w-20 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                                    {b.imagem_url? <img src={b.imagem_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full grid place-items-center text-[10px]">SEM IMG</div>}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold line-clamp-1">{b.titulo}</p>
                                    <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{b.link_url||"sem link"}</p>
                                </div>
                            </div>
                            <div className="hidden md:block col-span-2"><span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">{POSICOES.find(p=>p.value===b.posicao)?.label||b.posicao}</span></div>
                            <div className="hidden md:block col-span-1"><span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${b.ativo?'bg-green-50 text-green-700 border-green-200':'bg-zinc-100'}`}>{b.ativo?'ATIVO':'OFF'}</span></div>
                            <div className="hidden md:flex col-span-2 gap-1.5 text-[11px]"><span className="bg-zinc-50 border px-2 py-1 rounded-full">👁 {b.views||0}</span><span className="bg-zinc-50 border px-2 py-1 rounded-full">↗ {b.clicks||0}</span></div>
                            <div className="flex items-center justify-end gap-1.5 col-span-12 md:col-span-2 mt-2 md:mt-0">
                                <button onClick={()=>openEditBanner(b)} className="w-9 h-9 rounded-full bg-white border border-zinc-200 hover:bg-black hover:text-white grid place-items-center transition">✎</button>
                                <button onClick={()=>deleteBanner(b.id)} className="w-9 h-9 rounded-full bg-white border border-zinc-200 hover:bg-red-500 hover:text-white grid place-items-center transition">🗑</button>
                            </div>
                        </div>
                    ))}
                    {filteredBanners.length===0 && <div className="p-12 text-center text-sm text-zinc-400">Nenhum banner. Clica em + NOVO BANNER</div>}
                </div>
                )}
            </div>

            {showPostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()} />
                    <div className="relative bg-white rounded-[24px] w-full max-w-[560px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-[72px] px-5 pt-5 flex justify-between items-start bg-blue-50 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-white border shadow-sm flex items-center justify-center text-sm">📄</div>
                            <button onClick={() => setShowPostModal(false)} className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-gray-50">×</button>
                        </div>
                        <div className="px-6 pt-5 pb-3 shrink-0 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{editingPost? 'Editar Post' : 'Novo Post'}</h3>
                            <div className="flex gap-1.5 mt-4 overflow-x-auto scrollbar-none">
                                <TabBtn id="conteudo" label="Conteúdo" />
                                <TabBtn id="midia" label="Mídia" />
                                <TabBtn id="config" label="Config" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none px-6 py-4">
                            {tab === 'conteudo' && (
                                <div className="flex flex-col gap-3">
                                    <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value })} placeholder="Título do post *" className={inputClass} />
                                    <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value })} placeholder="Slug (auto)" className={inputClass} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <CustomSelect value={form.category_id} onChange={v => setForm({...form, category_id: v })} placeholder="Categoria" options={cats.map(c => ({ value: c.id, label: c.nome }))} />
                                        <CustomSelect value={form.tipo} onChange={v => setForm({...form, tipo: v })} placeholder="Tipo" options={TIPOS} />
                                    </div>
                                    <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value })} rows={2} placeholder="Descrição curta" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black" />
                                    <textarea value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value })} rows={6} placeholder="Conteúdo completo" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black" />
                                </div>
                            )}
                            {tab === 'midia' && (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex flex-col gap-1"><label className="text-xs font-bold tracking-widest text-black">MEDIA URL</label><input value={form.media_url} onChange={e => setForm({...form, media_url: e.target.value })} placeholder="https://..." className={inputClass} /></div>
                                        <div className="flex flex-col gap-1"><label className="text-xs font-bold tracking-widest text-black">THUMBNAIL</label><input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value })} placeholder="https://..." className={inputClass} /></div>
                                    </div>
                                    <div className="mt-2 p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                                        <p className="text-xs font-bold tracking-widest text-black mb-2">UPLOAD ARQUIVOS</p>
                                        <input type="file" multiple accept="image/*,video/*,audio/*,.pdf" onChange={e => setFiles(e.target.files)} className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-black file:text-white file:text-xs file:font-bold hover:file:bg-zinc-800" />
                                        {files && <p className="text-xs text-black/60 mt-2">{files.length} arquivo(s) selecionado(s)</p>}
                                    </div>
                                </div>
                            )}
                            {tab === 'config' && (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <CustomSelect value={form.status} onChange={v => setForm({...form, status: v })} placeholder="Status" options={STATUS} />
                                        <label className="flex items-center gap-2 h-11 px-3 border border-gray-200 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition">
                                            <input type="checkbox" checked={form.destaque} onChange={e => setForm({...form, destaque: e.target.checked })} className="w-4 h-4 accent-black rounded" />
                                            <span className="text-xs text-black font-medium">Destaque?</span>
                                        </label>
                                    </div>
                                    <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value })} placeholder="Tags separadas por vírgula" className={inputClass} />
                                </div>
                            )}
                        </div>
                        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex gap-2">
                            <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">×</button>
                            <button onClick={savePost} disabled={loading} className="flex-1 h-11 rounded-full bg-black text-white font-semibold hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50">{loading? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{editingPost? 'ATUALIZAR' : 'CRIAR'}</>}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCatModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()} />
                    <div className="relative bg-white rounded-[24px] w-full max-w-[400px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-[72px] px-5 pt-5 flex justify-between items-start bg-violet-50 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-white border shadow-sm flex items-center justify-center text-sm">🏷️</div>
                            <button onClick={() => setShowCatModal(false)} className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center">×</button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold">{editingCat? "Editar Categoria" : "Nova Categoria"}</h3>
                            <div className="mt-4 space-y-3">
                                <input value={catForm.nome} onChange={e => setCatForm({...catForm, nome: e.target.value })} placeholder="Nome ex: Política" className={inputClass} />
                                <input value={catForm.slug} onChange={e => setCatForm({...catForm, slug: e.target.value })} placeholder="Slug ex: politica" className={inputClass} />
                                <input value={catForm.descricao} onChange={e => setCatForm({...catForm, descricao: e.target.value })} placeholder="Descrição" className={inputClass} />
                                <div className="flex items-center gap-3 h-11 px-3 border border-gray-200 rounded-xl"><input type="color" value={catForm.cor} onChange={e => setCatForm({...catForm, cor: e.target.value })} className="w-8 h-8 rounded-full overflow-hidden border-0 p-0" /><span className="text-sm">Cor da categoria</span><span className="ml-auto text-xs text-black/50">{catForm.cor}</span></div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button onClick={() => setShowCatModal(false)} className="flex-1 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center">×</button>
                                <button onClick={saveCat} className="flex-1 h-11 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 flex items-center justify-center">SALVAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showBannerModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()} />
                    <div className="relative bg-white rounded-[24px] w-full max-w-[460px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="relative h-[72px] px-5 pt-5 flex justify-between items-start bg-amber-50 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-white border shadow-sm flex items-center justify-center text-sm">📢</div>
                            <button onClick={() => setShowBannerModal(false)} className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center">×</button>
                        </div>
                        <div className="p-6 overflow-y-auto scrollbar-none">
                            <h3 className="text-lg font-bold">{editingBanner? "Editar Banner" : "Novo Banner"}</h3>
                            <div className="mt-4 space-y-3">
                                <input value={bannerForm.titulo} onChange={e => setBannerForm({...bannerForm, titulo: e.target.value })} placeholder="Título do banner ex: Unitel 5G" className={inputClass} />
                                <CustomSelect value={bannerForm.posicao} onChange={v => setBannerForm({...bannerForm, posicao: v as BannerPos })} placeholder="Posição" options={POSICOES} />
                                <input value={bannerForm.link_url} onChange={e => setBannerForm({...bannerForm, link_url: e.target.value })} placeholder="Link ao clicar ex: https://..." className={inputClass} />
                                <input value={bannerForm.imagem_url} onChange={e => setBannerForm({...bannerForm, imagem_url: e.target.value })} placeholder="URL da imagem ou faz upload abaixo" className={inputClass} />
                                <div className="p-3 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                                    <p className="text-[10px] font-bold tracking-widest mb-2">UPLOAD IMAGEM BANNER</p>
                                    <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files)} className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-black file:text-white file:text-xs file:font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1"><label className="text-[10px] font-bold">INÍCIO</label><input type="date" value={bannerForm.data_inicio} onChange={e => setBannerForm({...bannerForm, data_inicio: e.target.value })} className={inputClass} /></div>
                                    <div className="flex flex-col gap-1"><label className="text-[10px] font-bold">FIM</label><input type="date" value={bannerForm.data_fim} onChange={e => setBannerForm({...bannerForm, data_fim: e.target.value })} className={inputClass} /></div>
                                </div>
                                <label className="flex items-center gap-2 h-11 px-3 border border-gray-200 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition">
                                    <input type="checkbox" checked={bannerForm.ativo} onChange={e => setBannerForm({...bannerForm, ativo: e.target.checked })} className="w-4 h-4 accent-black rounded" />
                                    <span className="text-xs text-black font-medium">Banner ativo?</span>
                                </label>
                                {bannerForm.imagem_url && <img src={bannerForm.imagem_url} className="w-full h-32 object-cover rounded-xl border" alt="preview" />}
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button onClick={() => setShowBannerModal(false)} className="flex-1 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center">×</button>
                                <button onClick={saveBanner} disabled={loading} className="flex-1 h-11 rounded-full bg-black text-white font-semibold hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50">{loading? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>SALVAR</>}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
