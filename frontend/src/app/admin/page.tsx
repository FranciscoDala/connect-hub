"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { API_URL, getToken, clearAuth, authHeader } from "../../lib/api";
import PostModal, { PostForm, FichaItem } from "./components/modal";

type Category = { id: string; nome: string; slug: string; cor?: string; descricao?: string };
type Post = any;
type Tab = 'conteudo' | 'midia' | 'produto' | 'plataforma' | 'evento' | 'config' | 'ficha';
type BannerPos = 'home_topo' | 'home_meio' | 'sidebar' | 'dentro_post' | 'footer';
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: BannerPos; ativo: boolean; clicks?: number; views?: number; data_inicio?: string; data_fim?: string };

const TIPOS_PLATAFORMA = ['plataforma','app','site','sistema','saas','case','projeto'];
const POSICOES: { value: BannerPos, label: string }[] = [
    { value: 'home_topo', label: 'Home Topo' },
    { value: 'home_meio', label: 'Home Meio' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'dentro_post', label: 'Dentro do Post' },
    { value: 'footer', label: 'Footer' },
];

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
    const [form, setForm] = useState<PostForm>({
        titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "", link_url: "",
        preco: "", preco_promocional: "", estoque: "", sku: "", unidade: "un", em_promocao: false,
        status_plataforma: "em_desenvolvimento", em_utilizacao: false,
        data_inicio: "", data_fim: "", local_evento: "", cidade: "", endereco: "", link_mapa: "", link_inscricao: "", modalidade: "presencial", capacidade: "", organizador: "",
        status_evento: "ativo", data_nova_inicio: ""
    });
    // ===== FICHA INFORMATIVA - NOVO =====
    const [ficha, setFicha] = useState<FichaItem[]>([]);
    const [camposFicha, setCamposFicha] = useState<string[]>([]);
    const [files, setFiles] = useState<FileList | null>(null);
    const [thumbFile, setThumbFile] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [catForm, setCatForm] = useState({ nome: "", slug: "", descricao: "", cor: "#7c3aed" });
    const [bannerForm, setBannerForm] = useState({ titulo: "", imagem_url: "", link_url: "", posicao: "home_topo" as BannerPos, ativo: true, data_inicio: "", data_fim: "" });
    const [bannerFile, setBannerFile] = useState<FileList | null>(null);

    useEffect(() => { if (!getToken()) { router.replace("/"); return; } loadAll(); loadCamposFicha(); }, []);

    async function loadCamposFicha() {
        try {
            const r = await fetch(`${API_URL}/api/v1/ficha-campos`, { headers: authHeader() as any });
            if (r.ok) setCamposFicha(await r.json());
        } catch {}
    }

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
        setForm({ titulo: "", slug: "", tipo: "noticia", descricao: "", conteudo: "", category_id: "", status: "published", destaque: false, tags: "", media_url: "", thumbnail_url: "", link_url: "", preco: "", preco_promocional: "", estoque: "1", sku: "", unidade: "un", em_promocao: false, status_plataforma: "em_desenvolvimento", em_utilizacao: false, data_inicio: "", data_fim: "", local_evento: "", cidade: "", endereco: "", link_mapa: "", link_inscricao: "", modalidade: "presencial", capacidade: "", organizador: "", status_evento: "ativo", data_nova_inicio: "" });
        setFicha([]);
        setFiles(null); setThumbFile(null); setTab('conteudo'); setShowPostModal(true);
    }
    function openEditPost(p: Post) {
        setEditingPost(p);
        setForm({
            titulo: p.titulo, slug: p.slug || "", tipo: p.tipo, descricao: p.descricao || "", conteudo: p.conteudo || "", category_id: p.category_id || "", status: p.status, destaque: p.destaque, tags: (p.tags || []).join(", "), media_url: p.media_url || "", thumbnail_url: p.thumbnail_url || "", link_url: p.link_url || "",
            preco: p.preco?.toString() || "", preco_promocional: p.preco_promocional?.toString() || "", estoque: p.estoque?.toString() || "", sku: p.sku || "", unidade: p.unidade || "un", em_promocao: p.em_promocao || false,
            status_plataforma: p.status_plataforma || (p.em_utilizacao ? 'em_utilizacao' : 'em_desenvolvimento'), em_utilizacao: p.em_utilizacao || p.status_plataforma === 'em_utilizacao',
            data_inicio: toDateTimeLocal(p.data_inicio), data_fim: toDateTimeLocal(p.data_fim), local_evento: p.local_evento || "", cidade: p.cidade || "", endereco: p.endereco || "", link_mapa: p.link_mapa || "", link_inscricao: p.link_inscricao || "", modalidade: p.modalidade || "presencial", capacidade: p.capacidade?.toString() || "", organizador: p.organizador || "",
            status_evento: p.status_evento || "ativo",
            data_nova_inicio: ""
        });
        // Carrega a ficha que já existe neste produto
        setFicha((p.ficha_informativa || []).map((f: any) => ({ campo: f.campo, valor: f.valor })));
        setFiles(null); setThumbFile(null); setTab(p.tipo === 'evento' ? 'evento' : 'conteudo'); setShowPostModal(true);
    }

    async function savePost() {
        if (!form.titulo) return toast.error("Título obrigatório");
        if (form.tipo === 'evento' && !form.data_inicio && form.status_evento === 'ativo') return toast.error("Data de início do evento obrigatória");
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
                // NOVO: envia a ficha - só campo + valor que tu digitaste
                payload.ficha_informativa = ficha.filter(f => f.campo && f.valor.trim()).map(f => ({ campo: f.campo, valor: f.valor.trim() }));
            }

            if(isEvento){
                let finalInicio = form.data_inicio;
                if(form.status_evento === 'adiado' && form.data_nova_inicio){
                    finalInicio = form.data_nova_inicio;
                }
                payload.data_inicio = finalInicio ? new Date(finalInicio).toISOString() : null;
                payload.data_fim = form.data_fim ? new Date(form.data_fim).toISOString() : null;
                payload.local_evento = form.local_evento || null;
                payload.cidade = form.cidade || null;
                payload.endereco = form.endereco || null;
                payload.link_mapa = form.link_mapa || null;
                payload.link_inscricao = form.link_inscricao || null;
                payload.modalidade = form.modalidade || "presencial";
                payload.capacidade = form.capacidade ? parseInt(form.capacidade) : 0;
                payload.organizador = form.organizador || null;
                payload.status_evento = form.status_evento || "ativo";
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
    const inputClass = "w-full h-11 bg-white border border-gray-200 rounded-xl px-3 text-[16px] text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition";

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
                        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder={mainTab === 'posts' ? "Buscar post..." : "Buscar banner..."} className="h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-[16px] outline-none focus:border-zinc-900 md:w-70" />
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
                            const eventoInfo = p.tipo === 'evento' ? (p.data_inicio ? new Date(p.data_inicio).toLocaleDateString() : 'Sem data') : '';
                            const statusEvento = (p.status_evento || 'ativo').toLowerCase();
                            const badgeEvento = statusEvento !== 'ativo' ? ` • ${statusEvento.toUpperCase()}` : '';
                            return (
                                <div key={p.id} className={`group border-b p-4 last:border-0 hover:bg-zinc-50/70 md:grid md:grid-cols-12 md:items-center md:px-6 md:py-4 ${statusEvento !== 'ativo' ? 'bg-red-50/30' : ''}`}>
                                    <div className="col-span-5 flex items-start gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-zinc-100">{p.thumbnail_url ? <img src={p.thumbnail_url} className={`h-full w-full object-cover ${statusEvento !== 'ativo' ? 'grayscale' : ''}`} alt="" /> : <div className="grid h-full w-full place-items-center bg-zinc-900 text-xs font-bold text-white">{p.tipo[0].toUpperCase()}</div>}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold leading-tight">{p.titulo} {badgeEvento && <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusEvento === 'cancelado' ? 'bg-red-100 text-red-700' : statusEvento === 'adiado' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-800 text-white'}`}>{badgeEvento}</span>}</p><p className="mt-1 text-xs text-zinc-500">{p.tipo} {eventoInfo && `• ${eventoInfo}`} {platStatus && `• ${platStatus}`} • {new Date(p.created_at).toLocaleDateString()}</p></div></div>
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

            {/* MODAL DO POST - AGORA EM ARQUIVO SEPARADO */}
            <PostModal
                show={showPostModal}
                editingPost={editingPost}
                form={form}
                setForm={setForm}
                tab={tab}
                setTab={setTab}
                cats={cats}
                ficha={ficha}
                setFicha={setFicha}
                camposFicha={camposFicha}
                files={files}
                setFiles={setFiles}
                thumbFile={thumbFile}
                setThumbFile={setThumbFile}
                loading={loading}
                onClose={() => setShowPostModal(false)}
                onSave={savePost}
            />

            {showBannerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex h-18 items-start justify-between bg-amber-50 px-5 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full border bg-white">📢</div><button onClick={() => setShowBannerModal(false)} className="grid h-8 w-8 place-items-center rounded-full border bg-white">×</button></div><div className="p-6 space-y-3"><input value={bannerForm.titulo} onChange={e => setBannerForm({ ...bannerForm, titulo: e.target.value })} placeholder="Título banner" className={inputClass} /><input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files)} className="text-[16px]" /><div className="flex gap-2"><button onClick={() => setShowBannerModal(false)} className="flex-1 h-11 rounded-full border">×</button><button onClick={saveBanner} disabled={loading} className="flex-1 h-11 rounded-full bg-black text-white">SALVAR</button></div></div></div></div>
            )}
            {showCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><h3 className="text-lg font-bold">{editingCat ? "Editar" : "Nova"} Categoria</h3><div className="mt-4 space-y-3"><input value={catForm.nome} onChange={e => setCatForm({ ...catForm, nome: e.target.value })} placeholder="Nome" className={inputClass} /><div className="flex items-center gap-3 rounded-xl border px-3"><input type="color" value={catForm.cor} onChange={e => setCatForm({ ...catForm, cor: e.target.value })} className="h-8 w-8" /><span className="text-[16px]">{catForm.cor}</span></div></div><div className="mt-6 flex gap-2"><button onClick={() => setShowCatModal(false)} className="flex-1 h-11 rounded-full border">×</button><button onClick={saveCat} className="flex-1 h-11 rounded-full bg-violet-600 text-white">SALVAR</button></div></div></div>
            )}
        </main>
    );
}
