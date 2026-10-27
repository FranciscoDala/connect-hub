"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { API_URL, getToken, clearAuth, authHeader } from "../../lib/api";

type Category = { id: string; nome: string; slug: string; cor?: string; descricao?: string };
type Post = any;
type Tab = 'conteudo' | 'midia' | 'produto' | 'plataforma' | 'evento' | 'config';
type BannerPos = 'home_topo' | 'home_meio' | 'sidebar' | 'dentro_post' | 'footer';
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: BannerPos; ativo: boolean; clicks?: number; views?: number; data_inicio?: string; data_fim?: string };

const TIPOS = [
    { value: 'noticia', label: 'Notícia' },
    { value: 'evento', label: 'Evento' },
    { value: 'produto', label: 'Produto' },
    { value: 'plataforma', label: 'Plataforma / SaaS' },
    { value: 'app', label: 'App' },
    { value: 'site', label: 'Site' },
    { value: 'sistema', label: 'Sistema' },
    { value: 'saas', label: 'SaaS' },
    { value: 'case', label: 'Case / Projeto' },
    { value: 'video', label: 'Vídeo' },
    { value: 'imagem', label: 'Imagem' },
];
const STATUS = [
    { value: 'published', label: 'Publicado' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'archived', label: 'Arquivado' },
];
const STATUS_PLATAFORMA = [
    { value: 'em_utilizacao', label: '● Em utilização' },
    { value: 'em_desenvolvimento', label: '● Em desenvolvimento' },
];
const MODALIDADES = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' },
    { value: 'hibrido', label: 'Híbrido' },
];
const POSICOES: { value: BannerPos, label: string }[] = [
    { value: 'home_topo', label: 'Home Topo' },
    { value: 'home_meio', label: 'Home Meio' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'dentro_post', label: 'Dentro do Post' },
    { value: 'footer', label: 'Footer' },
];
const TIPOS_PLATAFORMA = ['plataforma','app','site','sistema','saas','case','projeto'];

function generateCloudinaryThumb(videoUrl: string): string {
    if (!videoUrl) return "";
    if (videoUrl.includes("cloudinary") && videoUrl.includes("/video/upload/")) {
        const parts = videoUrl.split("/video/upload/");
        if (parts.length === 2) {
            let suffix = parts[1].replace(/^(so_[^/]+\/)+/, "");
            return `${parts[0]}/video/upload/so_1,w_1280,h_720,c_fill/${suffix}`.replace(/\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i, ".jpg");
        }
    }
    return "";
}

function CustomSelect({ value, options, onChange, placeholder }: { value: string, options: { value: string, label: string }[], onChange: (v: string) => void, placeholder: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const selected = options.find(o => o.value === value);
    return (
        <div ref={ref} className="relative w-full">
            <button type="button" onClick={() => setOpen(!open)} className={`w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm text-black flex items-center justify-between focus:outline-none focus:border-black transition ${open ? 'border-black ring-2 ring-black/10' : ''}`}>
                <span className={`truncate ${selected ? 'text-black font-medium' : 'text-black/40'}`}>{selected ? selected.label : placeholder}</span>
                <span className={`text-gray-400 transition-transform shrink-0 text-xs ${open ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open && (
                <div className="absolute z-50 top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-1.5 max-h-55 overflow-y-auto">
                    {options.map(o => (
                        <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${value === o.value ? 'bg-blue-50 font-semibold text-black' : 'hover:bg-gray-50 text-gray-700'}`}>
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
    const [mainTab, setMainTab] = useState<'posts' | 'banners'>('posts');
    const router = useRouter();
    const [showPostModal, setShowPostModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [tab, setTab] = useState<Tab>('conteudo');
    const [form, setForm] = useState({
        titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "", link_url: "",
        preco: "", preco_promocional: "", estoque: "", sku: "", unidade: "un", em_promocao: false,
        status_plataforma: "em_desenvolvimento", em_utilizacao: false,
        // evento
        data_inicio: "", data_fim: "", local_evento: "", cidade: "", endereco: "", link_mapa: "", link_inscricao: "", modalidade: "presencial", capacidade: "", organizador: ""
    });
    const [files, setFiles] = useState<FileList | null>(null);
    const [thumbFile, setThumbFile] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [catForm, setCatForm] = useState({ nome: "", slug: "", descricao: "", cor: "#7c3aed" });
    const [bannerForm, setBannerForm] = useState({ titulo: "", imagem_url: "", link_url: "", posicao: "home_topo" as BannerPos, ativo: true, data_inicio: "", data_fim: "" });
    const [bannerFile, setBannerFile] = useState<FileList | null>(null);

    useEffect(() => { if (!getToken()) { router.replace("/"); return; } loadAll(); }, []);

    async function loadAll() {
        try {
            const [pRes, cRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/posts`, { headers: authHeader() as any }),
                fetch(`${API_URL}/api/v1/categories`, { headers: authHeader() as any })
            ]);
            if (pRes.status === 401 || cRes.status === 401) throw new Error("401");
            const pData = await pRes.json();
            const cData = await cRes.json();
            setPosts(Array.isArray(pData) ? pData : []);
            setCats(Array.isArray(cData) ? cData : []);
            try {
                const bRes = await fetch(`${API_URL}/api/v1/banners`, { headers: authHeader() as any });
                if (bRes.ok) { const bData = await bRes.json(); setBanners(Array.isArray(bData) ? bData : []); }
            } catch {}
        } catch (e) {
            clearAuth(); router.replace("/");
        }
    }

    function toDateTimeLocal(iso?: string) {
        if (!iso) return "";
        const d = new Date(iso);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function openNewPost() {
        setEditingPost(null);
        setForm({ titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "", link_url: "", preco: "", preco_promocional: "", estoque: "1", sku: "", unidade: "un", em_promocao: false, status_plataforma: "em_desenvolvimento", em_utilizacao: false, data_inicio: "", data_fim: "", local_evento: "", cidade: "", endereco: "", link_mapa: "", link_inscricao: "", modalidade: "presencial", capacidade: "", organizador: "" });
        setFiles(null); setThumbFile(null); setTab('conteudo'); setShowPostModal(true);
    }
    function openEditPost(p: Post) {
        setEditingPost(p);
        setForm({
            titulo: p.titulo, slug: p.slug || "", tipo: p.tipo, descricao: p.descricao || "", conteudo: p.conteudo || "", category_id: p.category_id || "", status: p.status, destaque: p.destaque, tags: (p.tags || []).join(", "), media_url: p.media_url || "", thumbnail_url: p.thumbnail_url || "", link_url: p.link_url || "",
            preco: p.preco?.toString() || "", preco_promocional: p.preco_promocional?.toString() || "", estoque: p.estoque?.toString() || "", sku: p.sku || "", unidade: p.unidade || "un", em_promocao: p.em_promocao || false,
            status_plataforma: p.status_plataforma || (p.em_utilizacao ? 'em_utilizacao' : 'em_desenvolvimento'), em_utilizacao: p.em_utilizacao || p.status_plataforma === 'em_utilizacao',
            data_inicio: toDateTimeLocal(p.data_inicio), data_fim: toDateTimeLocal(p.data_fim), local_evento: p.local_evento || "", cidade: p.cidade || "", endereco: p.endereco || "", link_mapa: p.link_mapa || "", link_inscricao: p.link_inscricao || "", modalidade: p.modalidade || "presencial", capacidade: p.capacidade?.toString() || "", organizador: p.organizador || ""
        });
        setFiles(null); setThumbFile(null); setTab(p.tipo === 'evento' ? 'evento' : 'conteudo'); setShowPostModal(true);
    }

    async function savePost() {
        if (!form.titulo) return toast.error("Título obrigatório");
        if (form.tipo === 'evento' && !form.data_inicio) return toast.error("Data de início do evento obrigatória");
        setLoading(true);
        try {
            let media_url = form.media_url.trim();
            let thumbnail_url = form.thumbnail_url.trim();
            let media_files = null;
            let media_type = null;
            if (thumbFile && thumbFile.length > 0) {
                const fd = new FormData(); fd.append("file", thumbFile[0]);
                const up = await fetch(`${API_URL}/api/v1/upload`, { method: "POST", headers: authHeader() as any, body: fd });
                const d = await up.json(); if (d.url) thumbnail_url = d.url;
            }
            if (files && files.length > 0) {
                const uploaded: any[] = [];
                for (let i = 0; i < files.length; i++) { const fd = new FormData(); fd.append("file", files[i]); const up = await fetch(`${API_URL}/api/v1/upload`, { method: "POST", headers: authHeader() as any, body: fd }); const d = await up.json(); uploaded.push(d); }
                media_files = uploaded;
                const videoFile = uploaded.find((u: any) => u.url?.match(/\.(mp4|mov|webm|m4v)/i) || u.type?.includes("video"));
                const mainFile = videoFile || uploaded[0];
                if (mainFile?.url) media_url = mainFile.url;
                if (mainFile?.type) media_type = mainFile.type;
                if (!thumbnail_url) {
                    const imgFile = uploaded.find((u: any) => u.url?.match(/\.(jpg|jpeg|png|webp)/i) || u.type?.includes("image"));
                    if (imgFile?.url && !videoFile) thumbnail_url = imgFile.url;
                    else if (videoFile?.url) thumbnail_url = generateCloudinaryThumb(videoFile.url);
                }
            }
            if (!thumbnail_url && media_url) { const autoThumb = generateCloudinaryThumb(media_url); if (autoThumb) thumbnail_url = autoThumb; }
            if (!thumbnail_url && media_url && media_url.match(/\.(jpg|jpeg|png|webp)/i)) thumbnail_url = media_url;

            const isPlatTipo = TIPOS_PLATAFORMA.includes(form.tipo);
            const isEvento = form.tipo === 'evento';

            const payload: any = {
                titulo: form.titulo,
                slug: form.slug || form.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                tipo: form.tipo, descricao: form.descricao, conteudo: form.conteudo,
                category_id: form.category_id || null, status: form.status, destaque: form.destaque,
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                media_url, thumbnail_url, link_url: form.link_url || null, media_type: media_type || form.tipo, media_files,
            };

            if (isPlatTipo) {
                payload.status_plataforma = form.status_plataforma;
                payload.em_utilizacao = form.status_plataforma === 'em_utilizacao' || form.em_utilizacao;
            }

            if(form.tipo === 'produto'){
                payload.preco = form.preco ? parseFloat(form.preco) : null;
                payload.preco_promocional = form.preco_promocional ? parseFloat(form.preco_promocional) : null;
                payload.estoque = form.estoque ? parseInt(form.estoque) : 0;
                payload.sku = form.sku || null;
                payload.unidade = form.unidade || "un";
                payload.em_promocao = form.em_promocao;
            }

            if(isEvento){
                payload.data_inicio = form.data_inicio ? new Date(form.data_inicio).toISOString() : null;
                payload.data_fim = form.data_fim ? new Date(form.data_fim).toISOString() : null;
                payload.local_evento = form.local_evento || null;
                payload.cidade = form.cidade || null;
                payload.endereco = form.endereco || null;
                payload.link_mapa = form.link_mapa || null;
                payload.link_inscricao = form.link_inscricao || null;
                payload.modalidade = form.modalidade || "presencial";
                payload.capacidade = form.capacidade ? parseInt(form.capacidade) : 0;
                payload.organizador = form.organizador || null;
            }

            const method = editingPost ? "PUT" : "POST";
            const url = editingPost ? `${API_URL}/api/v1/posts/${editingPost.id}` : `${API_URL}/api/v1/posts`;
            const res = await fetch(url, { method, body: JSON.stringify(payload), headers: { "Content-Type": "application/json", ...authHeader() } as any });
            if (!res.ok) throw new Error(await res.text());
            toast.success(editingPost ? "Atualizado!" : "Criado!"); setShowPostModal(false); loadAll();
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }

    async function deletePost(id: string) { if (!confirm("Apagar post?")) return; await fetch(`${API_URL}/api/v1/posts/${id}`, { method: "DELETE", headers: authHeader() as any }); setPosts(posts.filter(p => p.id !== id)); toast.success("Apagado"); }
    function openNewCat() { setEditingCat(null); setCatForm({ nome: "", slug: "", descricao: "", cor: "#7c3aed" }); setShowCatModal(true); }
    function openEditCat(c: Category) { setEditingCat(c as any); setCatForm({ nome: c.nome, slug: c.slug, descricao: (c as any).descricao || "", cor: (c as any).cor || "#7c3aed" }); setShowCatModal(true); }
    async function saveCat() { const method = editingCat ? "PUT" : "POST"; const url = editingCat ? `${API_URL}/api/v1/categories/${editingCat.id}` : `${API_URL}/api/v1/categories`; const res = await fetch(url, { method, body: JSON.stringify({ ...catForm, slug: catForm.slug || catForm.nome.toLowerCase().replace(/\s+/g, "-") }), headers: { "Content-Type": "application/json", ...authHeader() } as any }); if (!res.ok) return toast.error("Erro categoria"); setShowCatModal(false); loadAll(); toast.success("Categoria salva!"); }
    async function deleteCat(id: string) { if (!confirm("Apagar categoria?")) return; await fetch(`${API_URL}/api/v1/categories/${id}`, { method: "DELETE", headers: authHeader() as any }); loadAll(); }
    function openNewBanner() { setEditingBanner(null); setBannerForm({ titulo: "", imagem_url: "", link_url: "", posicao: "home_topo", ativo: true, data_inicio: "", data_fim: "" }); setBannerFile(null); setShowBannerModal(true); }
    function openEditBanner(b: Banner) { setEditingBanner(b); setBannerForm({ titulo: b.titulo, imagem_url: b.imagem_url, link_url: b.link_url || "", posicao: b.posicao, ativo: b.ativo, data_inicio: b.data_inicio ? b.data_inicio.split('T')[0] : "", data_fim: b.data_fim ? b.data_fim.split('T')[0] : "" }); setShowBannerModal(true); }
    async function saveBanner() {
        if (!bannerForm.titulo) return toast.error("Título obrigatório");
        setLoading(true);
        try {
            let imagem_url = bannerForm.imagem_url;
            if (bannerFile && bannerFile.length > 0) { const fd = new FormData(); fd.append("file", bannerFile[0]); const up = await fetch(`${API_URL}/api/v1/upload`, { method: "POST", headers: authHeader() as any, body: fd }); const d = await up.json(); imagem_url = d.url; }
            if (!imagem_url) return toast.error("Imagem obrigatória");
            const payload = { ...bannerForm, imagem_url, data_inicio: bannerForm.data_inicio || null, data_fim: bannerForm.data_fim || null, link_url: bannerForm.link_url || null };
            const method = editingBanner ? "PUT" : "POST";
            const url = editingBanner ? `${API_URL}/api/v1/banners/${editingBanner.id}` : `${API_URL}/api/v1/banners`;
            const res = await fetch(url, { method, body: JSON.stringify(payload), headers: { "Content-Type": "application/json", ...authHeader() } as any });
            if (!res.ok) throw new Error(await res.text());
            toast.success(editingBanner ? "Banner atualizado!" : "Banner criado!"); setShowBannerModal(false); loadAll();
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }
    async function deleteBanner(id: string) { if (!confirm("Apagar banner?")) return; await fetch(`${API_URL}/api/v1/banners/${id}`, { method: "DELETE", headers: authHeader() as any }); setBanners(banners.filter(b => b.id !== id)); toast.success("Apagado"); }

    const filtered = posts.filter(p => p.titulo.toLowerCase().includes(filter.toLowerCase()));
    const filteredBanners = banners.filter(b => b.titulo.toLowerCase().includes(filter.toLowerCase()));
    const inputClass = "w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition";
    const TabBtn = ({ id, label, show = true }: { id: Tab, label: string, show?: boolean }) => {
        if(!show) return null;
        return (<button type="button" onClick={() => setTab(id)} className={`px-3.5 py-2 text-sm font-medium rounded-full transition border shrink-0 ${tab === id ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{label}</button>)
    };
    const previewAutoThumb = form.media_url ? generateCloudinaryThumb(form.media_url) : "";
    const previewFinalThumb = form.thumbnail_url || previewAutoThumb || form.media_url;
    const isProduto = form.tipo === 'produto';
    const isPlataforma = TIPOS_PLATAFORMA.includes(form.tipo);
    const isEvento = form.tipo === 'evento';

    return (
        <main className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans">
            <Toaster richColors position="top-center" />
            <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-8">
                    <Link href="/" className="flex items-center"><img src="/connect.png" alt="CONNECT" className="h-9 sm:h-10 w-auto object-contain" /></Link>
                    <div className="flex items-center gap-3"><span className="hidden text-xs font-bold tracking-widest sm:block">ADMIN • CONNECT.AO</span><button onClick={() => { clearAuth(); router.replace("/"); }} className="rounded-full bg-[#0e8ac2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0c709e]">SAIR</button></div>
                </nav>
            </header>

            <div className="mx-auto max-w-7xl px-4 md:px-6 pb-8 pt-24 md:pt-28">
                {cats.length > 0 && (
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                        {cats.map(c => (
                            <div key={c.id} className="flex shrink-0 items-center gap-2 rounded-full border bg-white py-1.5 pl-3 pr-1.5 text-xs shadow-sm">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: (c as any).cor || "#7c3aed" }} />
                                <span className="font-medium">{c.nome}</span>
                                <div className="ml-1 flex items-center gap-0.5">
                                    <button onClick={() => openEditCat(c)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-zinc-100">✎</button>
                                    <button onClick={() => deleteCat(c.id)} className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500">×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-6 flex gap-2">
                    <button onClick={() => setMainTab('posts')} className={`h-9 rounded-full border px-5 text-xs font-semibold transition ${mainTab === 'posts' ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>POSTS</button>
                    <button onClick={() => setMainTab('banners')} className={`h-9 rounded-full border px-5 text-xs font-semibold transition ${mainTab === 'banners' ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>BANNERS</button>
                </div>

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-sm font-semibold tracking-wide">{mainTab === 'posts' ? `Posts • ${filtered.length}` : `Banners • ${filteredBanners.length}`}</h2>
                    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder={mainTab === 'posts' ? "Buscar post..." : "Buscar banner..."} className="h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 md:w-70" />
                        <div className="flex gap-2">
                            {mainTab === 'posts' ? (
                                <>
                                    <button onClick={openNewCat} className="h-10 flex-1 rounded-full border border-zinc-200 bg-white px-5 text-xs font-semibold hover:bg-zinc-50 md:flex-none">+ CATEGORIA</button>
                                    <button onClick={openNewPost} className="h-10 flex-1 rounded-full bg-zinc-900 px-5 text-xs font-semibold text-white hover:bg-black md:flex-none">+ NOVO POST</button>
                                </>
                            ) : (<button onClick={openNewBanner} className="h-10 rounded-full bg-zinc-900 px-5 text-xs font-semibold text-white hover:bg-black">+ NOVO BANNER</button>)}
                        </div>
                    </div>
                </div>

                {mainTab === 'posts' ? (
                    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                        <div className="hidden grid-cols-12 bg-zinc-50/50 px-6 py-3 text-xs tracking-widest text-zinc-400 md:grid"><div className="col-span-5">TÍTULO</div><div className="col-span-2">CATEGORIA</div><div className="col-span-1">STATUS</div><div className="col-span-2">MÉTRICAS</div><div className="col-span-2 text-right">AÇÕES</div></div>
                        {filtered.map(p => {
                            const views = p.views ?? p.views_count ?? 0;
                            const catName = cats.find(c => c.id === p.category_id)?.nome || "—";
                            const isPlatList = TIPOS_PLATAFORMA.includes((p.tipo || '').toLowerCase());
                            const platStatus = isPlatList ? (p.em_utilizacao || p.status_plataforma === 'em_utilizacao' ? '● EM UTILIZAÇÃO' : '● EM DESENV') : '';
                            const eventoInfo = p.tipo === 'evento' ? (p.data_inicio ? new Date(p.data_inicio).toLocaleDateString() : 'sem data') : '';
                            return (
                                <div key={p.id} className="group border-b p-4 last:border-0 hover:bg-zinc-50/70 md:grid md:grid-cols-12 md:items-center md:px-6 md:py-4">
                                    <div className="col-span-5 flex items-start gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-zinc-100">{p.thumbnail_url ? <img src={p.thumbnail_url} className="h-full w-full object-cover" alt="" /> : <div className="grid h-full w-full place-items-center bg-zinc-900 text-xs font-bold text-white">{p.tipo[0].toUpperCase()}</div>}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold leading-tight">{p.titulo}</p><p className="mt-1 text-xs text-zinc-500">{p.tipo} {eventoInfo && `• ${eventoInfo}`} {platStatus && `• ${platStatus}`} • {new Date(p.created_at).toLocaleDateString()}</p></div></div>
                                    <div className="hidden col-span-2 md:block"><span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{catName}</span></div>
                                    <div className="hidden col-span-1 md:flex"><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${p.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100'}`}>{p.status}</span></div>
                                    <div className="hidden col-span-2 md:flex"><span className="rounded-full border bg-zinc-50 px-2 py-1 text-xs">{views} views {p.tipo==='evento' && p.inscritos_count ? `• ${p.inscritos_count} inscritos` : ''}</span></div>
                                    <div className="col-span-12 mt-3 flex justify-end gap-1.5 border-t pt-3 md:col-span-2 md:mt-0 md:border-0 md:pt-0"><button onClick={() => openEditPost(p)} className="grid h-9 w-9 place-items-center rounded-full border bg-white hover:bg-zinc-900 hover:text-white">✎</button><button onClick={() => deletePost(p.id)} className="grid h-9 w-9 place-items-center rounded-full border bg-white text-zinc-500 hover:bg-red-500 hover:text-white">🗑</button></div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                        {filteredBanners.map(b => (
                            <div key={b.id} className="flex items-center gap-3 border-b p-4 last:border-0 md:grid md:grid-cols-12 md:px-6"><div className="col-span-5 flex gap-3"><div className="h-12 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100"><img src={b.imagem_url} className="h-full w-full object-cover" alt="" /></div><div><p className="text-sm font-semibold">{b.titulo}</p><p className="max-w-50 truncate text-xs text-zinc-500">{b.link_url || "sem link"}</p></div></div><div className="ml-auto flex gap-1.5 md:col-span-2 md:ml-0 md:justify-end"><button onClick={() => openEditBanner(b)} className="grid h-9 w-9 place-items-center rounded-full border hover:bg-black hover:text-white">✎</button><button onClick={() => deleteBanner(b.id)} className="grid h-9 w-9 place-items-center rounded-full border hover:bg-red-500 hover:text-white">🗑</button></div></div>
                        ))}
                    </div>
                )}
            </div>

            {showPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex h-18 shrink-0 items-start justify-between bg-blue-50 px-5 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full border bg-white shadow-sm text-sm">{isEvento ? '📅' : isProduto ? '📦' : isPlataforma ? '💻' : '📄'}</div><button onClick={() => setShowPostModal(false)} className="grid h-8 w-8 place-items-center rounded-full border bg-white">×</button></div>
                        <div className="border-b px-6 pb-3 pt-5"><h3 className="text-lg font-bold">{editingPost ? 'Editar' : 'Novo'} {isEvento ? 'Evento' : isProduto ? 'Produto' : isPlataforma ? 'Plataforma' : 'Post'}</h3><div className="mt-4 flex gap-1.5 flex-wrap"><TabBtn id="conteudo" label="Conteúdo" /><TabBtn id="evento" label="Evento" show={isEvento} /><TabBtn id="midia" label="Mídia" /><TabBtn id="plataforma" label="Plataforma / Link" show={isPlataforma} /><TabBtn id="produto" label="Preço" show={isProduto} /><TabBtn id="config" label="Config" /></div></div>
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {tab === 'conteudo' && <div className="flex flex-col gap-3"><input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder={isEvento ? "Nome do evento *" : isProduto ? "Nome do produto *" : isPlataforma ? "Nome da plataforma / site *" : "Título *"} className={inputClass} /><div className="grid gap-2 md:grid-cols-2"><CustomSelect value={form.category_id} onChange={v => setForm({ ...form, category_id: v })} placeholder="Categoria" options={cats.map(c => ({ value: c.id, label: c.nome }))} /><CustomSelect value={form.tipo} onChange={v => { setForm({ ...form, tipo: v }); if(v==='produto') setTab('produto'); else if(v==='evento') setTab('evento'); else if(TIPOS_PLATAFORMA.includes(v)) setTab('plataforma'); }} placeholder="Tipo" options={TIPOS} /></div><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} placeholder={isEvento ? "Resumo do evento - aparece no card" : isPlataforma ? "Descrição curta - aparece no card" : isProduto ? "Descrição curta do produto" : "Descrição curta"} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:border-black" /><textarea value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} rows={5} placeholder={isEvento ? "Programação completa, palestrantes, etc..." : isPlataforma ? "Sobre a plataforma, tecnologias usadas..." : isProduto ? "Ficha técnica / conteúdo detalhado" : "Conteúdo completo"} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:border-black" /></div>}
                            {tab === 'evento' && isEvento && (
                                <div className="flex flex-col gap-3">
                                    <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-xs text-sky-800">📅 Configuração do Evento - será exibido em /eventos</div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div><label className="text-xs font-semibold">Data Início *</label><input type="datetime-local" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} className={inputClass} /></div>
                                        <div><label className="text-xs font-semibold">Data Fim</label><input type="datetime-local" value={form.data_fim} onChange={e => setForm({ ...form, data_fim: e.target.value })} className={inputClass} /></div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div><label className="text-xs font-semibold">Local</label><input value={form.local_evento} onChange={e => setForm({ ...form, local_evento: e.target.value })} placeholder="Hotel Intercontinental" className={inputClass} /></div>
                                        <div><label className="text-xs font-semibold">Cidade</label><input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Luanda" className={inputClass} /></div>
                                    </div>
                                    <div><label className="text-xs font-semibold">Endereço completo</label><input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Av. 4 de Fevereiro, 123" className={inputClass} /></div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div><label className="text-xs font-semibold">Modalidade</label><CustomSelect value={form.modalidade} onChange={v => setForm({ ...form, modalidade: v })} placeholder="Modalidade" options={MODALIDADES} /></div>
                                        <div><label className="text-xs font-semibold">Capacidade</label><input type="number" value={form.capacidade} onChange={e => setForm({ ...form, capacidade: e.target.value })} placeholder="100" className={inputClass} /></div>
                                    </div>
                                    <div><label className="text-xs font-semibold">Link de Inscrição (Sympla, Forms, WhatsApp)</label><input value={form.link_inscricao} onChange={e => setForm({ ...form, link_inscricao: e.target.value })} placeholder="https://wa.me/..." className={inputClass} /></div>
                                    <div><label className="text-xs font-semibold">Link do Mapa (Google Maps)</label><input value={form.link_mapa} onChange={e => setForm({ ...form, link_mapa: e.target.value })} placeholder="https://maps.google.com/..." className={inputClass} /></div>
                                    <div><label className="text-xs font-semibold">Organizador</label><input value={form.organizador} onChange={e => setForm({ ...form, organizador: e.target.value })} placeholder="CONNECT Angola" className={inputClass} /></div>
                                </div>
                            )}
                            {tab === 'midia' && <div className="flex flex-col gap-3"><input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="Media URL" className={inputClass} /><div><p className="mb-1 text-xs font-semibold">Thumbnail (capa) - Recomendado 1280x720</p><input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files)} className="text-sm" /></div><div><p className="mb-1 text-xs font-semibold">Galeria</p><input type="file" multiple onChange={e => setFiles(e.target.files)} className="text-sm" /></div>{previewFinalThumb && <img src={previewFinalThumb} className="h-40 w-full rounded-xl border object-cover" alt="" />}</div>}
                            {tab === 'plataforma' && isPlataforma && (
                                <div className="flex flex-col gap-3">
                                    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">🔗 Configuração de Plataforma</div>
                                    <div><label className="text-xs font-semibold">Link da Plataforma / App / Site</label><input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." className={inputClass} /></div>
                                    <div><label className="text-xs font-semibold">Status da Plataforma</label><CustomSelect value={form.status_plataforma} onChange={v => setForm({ ...form, status_plataforma: v, em_utilizacao: v === 'em_utilizacao' })} placeholder="Status" options={STATUS_PLATAFORMA} /></div>
                                    <div><label className="text-xs font-semibold">Tags</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="SAAS, APP, SITE" className={inputClass} /></div>
                                </div>
                            )}
                            {tab === 'produto' && isProduto && (
                                <div className="flex flex-col gap-3">
                                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">💰 Configuração de Produto</div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div><label className="text-xs font-semibold">Preço (Kz) *</label><input value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} type="number" placeholder="150000" className={inputClass} /></div>
                                        <div><label className="text-xs font-semibold">Preço Promocional (Kz)</label><input value={form.preco_promocional} onChange={e => setForm({ ...form, preco_promocional: e.target.value })} type="number" placeholder="129000" className={inputClass} /></div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div><label className="text-xs font-semibold">Estoque</label><input value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} type="number" placeholder="10" className={inputClass} /></div>
                                        <div><label className="text-xs font-semibold">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="EXO-001" className={inputClass} /></div>
                                        <div><label className="text-xs font-semibold">Unidade</label><CustomSelect value={form.unidade} onChange={v => setForm({ ...form, unidade: v })} placeholder="Unidade" options={[{value:'un',label:'Unidade'},{value:'cx',label:'Caixa'},{value:'kit',label:'Kit'},{value:'mês',label:'Mês'}]} /></div>
                                    </div>
                                    <label className="flex items-center gap-2 rounded-xl border p-3 cursor-pointer hover:bg-zinc-50"><input type="checkbox" checked={form.em_promocao} onChange={e => setForm({ ...form, em_promocao: e.target.checked })} /><span className="text-sm font-medium">Em promoção?</span></label>
                                </div>
                            )}
                            {tab === 'config' && <div className="flex flex-col gap-3"><CustomSelect value={form.status} onChange={v => setForm({ ...form, status: v })} placeholder="Status" options={STATUS} /><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags separadas por vírgula" className={inputClass} /><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (opcional)" className={inputClass} /><label className="flex items-center gap-2"><input type="checkbox" checked={form.destaque} onChange={e => setForm({ ...form, destaque: e.target.checked })} /> Destaque na home</label></div>}
                        </div>
                        <div className="flex gap-2 border-t bg-white px-6 py-4"><button onClick={() => setShowPostModal(false)} className="flex-1 h-11 rounded-full border">×</button><button onClick={savePost} disabled={loading} className="flex-1 h-11 rounded-full bg-black text-white font-semibold disabled:opacity-50">{loading ? "…" : editingPost ? 'ATUALIZAR' : 'CRIAR'}</button></div>
                    </div>
                </div>
            )}
            {showBannerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex h-18 items-start justify-between bg-amber-50 px-5 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full border bg-white">📢</div><button onClick={() => setShowBannerModal(false)} className="grid h-8 w-8 place-items-center rounded-full border bg-white">×</button></div><div className="p-6 space-y-3"><input value={bannerForm.titulo} onChange={e => setBannerForm({ ...bannerForm, titulo: e.target.value })} placeholder="Título banner" className={inputClass} /><CustomSelect value={bannerForm.posicao} onChange={v => setBannerForm({ ...bannerForm, posicao: v as BannerPos })} placeholder="Posição" options={POSICOES} /><input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files)} className="text-sm" /><div className="flex gap-2"><button onClick={() => setShowBannerModal(false)} className="flex-1 h-11 rounded-full border">×</button><button onClick={saveBanner} disabled={loading} className="flex-1 h-11 rounded-full bg-black text-white">SALVAR</button></div></div></div></div>
            )}
            {showCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><h3 className="text-lg font-bold">{editingCat ? "Editar" : "Nova"} Categoria</h3><div className="mt-4 space-y-3"><input value={catForm.nome} onChange={e => setCatForm({ ...catForm, nome: e.target.value })} placeholder="Nome" className={inputClass} /><div className="flex items-center gap-3 rounded-xl border px-3"><input type="color" value={catForm.cor} onChange={e => setCatForm({ ...catForm, cor: e.target.value })} className="h-8 w-8" /><span className="text-sm">{catForm.cor}</span></div></div><div className="mt-6 flex gap-2"><button onClick={() => setShowCatModal(false)} className="flex-1 h-11 rounded-full border">×</button><button onClick={saveCat} className="flex-1 h-11 rounded-full bg-violet-600 text-white">SALVAR</button></div></div></div>
            )}
        </main>
    );
}
