// app/post/[slug]/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatKz(v?: number | null) {
    if (v == null) return null;
    return Number(v).toLocaleString("pt-AO") + " Kz";
}

function getClientId() {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem("connect_client_id");
    if (!id) {
        id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("connect_client_id", id);
    }
    return id;
}

export default function PostPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [post, setPost] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [myReaction, setMyReaction] = useState<string | null>(null);

    const [commentNome, setCommentNome] = useState("");
    const [commentText, setCommentText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                let res = await fetch(`${API}/api/v1/posts/slug/${slug}`);
                if (!res.ok) res = await fetch(`${API}/api/v1/posts/${slug}`);
                if (!res.ok) {
                    const all = await fetch(`${API}/api/v1/posts?limit=100`).then(r => r.json());
                    const found = all.find((p: any) => p.slug === slug || p.id === slug);
                    if (found) { setPost(found); } else { setLoading(false); return; }
                } else {
                    const data = await res.json();
                    setPost(data);
                    setLikes(data.likes_count || 0);
                    setDislikes(data.dislikes_count || 0);
                }
            } catch { }
            setLoading(false);
        })();
    }, [slug]);

    useEffect(() => {
        if (!post) return;
        const clientId = getClientId();
        // view
        fetch(`${API}/api/v1/posts/${post.id}/view`, { method: "POST" }).catch(() => { });
        // my reaction
        fetch(`${API}/api/v1/posts/${post.id}/reaction?client_id=${clientId}`)
            .then(r => r.json()).then(d => setMyReaction(d.user_reaction)).catch(() => { });
        // comments
        fetch(`${API}/api/v1/posts/${post.id}/comments`).then(r => r.json()).then(setComments).catch(() => { });
        // categories, banners, related
        fetch(`${API}/api/v1/categories`).then(r => r.json()).then(setCategories).catch(() => { });
        fetch(`${API}/api/v1/banners?ativo=true`).then(r => r.json()).then(setBanners).catch(() => { });
        if (post.category_id) {
            fetch(`${API}/api/v1/posts?category_id=${post.category_id}&limit=6`).then(r => r.json()).then((data: any[]) => setRelated(data.filter(p => p.id !== post.id).slice(0, 4))).catch(() => { });
        }
    }, [post]);

    async function react(type: 'like' | 'dislike') {
        const client_id = getClientId();
        const res = await fetch(`${API}/api/v1/posts/${post.id}/reaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, client_id })
        });
        if (res.ok) {
            const d = await res.json();
            setLikes(d.likes_count);
            setDislikes(d.dislikes_count);
            setMyReaction(d.user_reaction);
        }
    }

    async function share() {
        const url = `https://connect-uuo9.onrender.com/post/${post.slug || post.id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: post.titulo, url });
            } else {
                await navigator.clipboard.writeText(url);
                alert("Link copiado!");
            }
            fetch(`${API}/api/v1/posts/${post.id}/share`, { method: "POST" }).catch(() => { });
        } catch { }
    }

    async function sendComment() {
        if (!commentText.trim()) return;
        const res = await fetch(`${API}/api/v1/posts/${post.id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: commentNome || "Anónimo", conteudo: commentText })
        });
        if (res.ok) {
            const c = await res.json();
            setComments([c, ...comments]);
            setCommentText("");
        }
    }

    async function updateComment(id: string) {
        if (!editText.trim()) return;
        const res = await fetch(`${API}/api/v1/comments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conteudo: editText })
        });
        if (res.ok) {
            const updated = await res.json();
            setComments(comments.map(c => c.id === id ? updated : c));
            setEditingId(null);
        }
    }

    async function deleteComment(id: string) {
        if (!confirm("Apagar comentário?")) return;
        const res = await fetch(`${API}/api/v1/comments/${id}`, { method: "DELETE" });
        if (res.ok) setComments(comments.filter(c => c.id !== id));
    }

    if (loading) return <div className="min-h-screen grid place-items-center">Carregando...</div>;
    if (!post) return <div className="min-h-screen grid place-items-center">Post não encontrado</div>;

    const isProduto = ['produto', 'product'].includes((post.tipo || '').toLowerCase());
    const cat = categories.find((c: any) => c.id === post.category_id);
    const bannerDentro = banners.find((b: any) => b.posicao === 'dentro_post');
    const bannerSidebar = banners.find((b: any) => b.posicao === 'sidebar');

    return (
        <main className="min-h-screen bg-white text-slate-800">
            <Header />

            <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-24 pb-6">
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide">
                    <Link href="/" className="text-slate-400 hover:text-slate-700">Início</Link>
                    <span className="text-slate-300">/</span>
                    {cat && <><Link href={`/#${cat.slug}`} className="font-bold uppercase tracking-widest text-sky-700">{cat.nome}</Link><span className="text-slate-300">/</span></>}
                    <span className="text-slate-500 truncate max-w-50">{post.tipo}</span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-20 sm:pb-28">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    <article className="col-span-12 lg:col-span-8">
                        {/* IMAGEM EM CIMA - PRIORIDADE */}
                        {(post.thumbnail_url || post.media_url) && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="h-auto max-h-130 w-full object-cover" />
                            </div>
                        )}

                        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="h-px w-8 bg-sky-600" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-sky-800">{cat?.nome || post.tipo}</span>
                                    <span className="text-[11px] text-slate-400 ml-auto">{new Date(post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <h1 className="mt-5 text-[28px] sm:text-[40px] font-semibold tracking-tight text-slate-700 leading-[0.95] wrap-break-word">{post.titulo}</h1>
                                {post.descricao && <p className="mt-4 max-w-3xl text-[15px] leading-6 text-slate-500">{post.descricao}</p>}

                                {isProduto && post.preco && (
                                    <div className="mt-6 flex items-baseline gap-3">
                                        <span className="text-[28px] font-bold tracking-tight text-slate-800">{formatKz(post.preco_promocional || post.preco)}</span>
                                        {post.em_promocao && post.preco_promocional && <span className="text-sm line-through text-slate-400">{formatKz(post.preco)}</span>}
                                    </div>
                                )}

                                {/* ACTIONS - LIKE / DISLIKE / SHARE / VIEWS */}
                                <div className="mt-6 flex flex-wrap items-center gap-2">
                                    <button onClick={() => react('like')} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${myReaction === 'like' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>👍 {likes}</button>
                                    <button onClick={() => react('dislike')} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${myReaction === 'dislike' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>👎 {dislikes}</button>
                                    <button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium hover:bg-slate-50">↗ Partilhar</button>
                                    <span className="ml-auto inline-flex rounded-full bg-slate-50 border px-3 py-2 text-xs">👁 {post.views || 0} • 💬 {comments.length}</span>
                                </div>
                            </div>

                            <div className="border-t p-6 sm:p-8">
                                <div className="prose prose-slate max-w-none prose-p:text-[14px] prose-p:leading-7 prose-p:text-slate-600 prose-headings:font-semibold prose-headings:text-slate-800">
                                    {post.conteudo ? <div dangerouslySetInnerHTML={{ __html: post.conteudo }} /> : <p>{post.descricao}</p>}
                                </div>

                                {post.tags?.length > 0 && (
                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {post.tags.map((t: string) => <span key={t} className="rounded-full border bg-slate-50 px-3 py-1 text-[11px]">#{t}</span>)}
                                    </div>
                                )}

                                {bannerDentro && (
                                    <div className="mt-10"><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Publicidade</p><a href={bannerDentro.link_url} target="_blank" className="block overflow-hidden rounded-2xl border"><img src={bannerDentro.imagem_url} alt="" className="w-full" /></a></div>
                                )}

                                {/* COMENTARIOS */}
                                <div className="mt-12">
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Comentários • {comments.length}</h3>
                                    <div className="mt-4 flex-col gap-3 rounded-2xl border bg-slate-50 p-4">
                                        <input value={commentNome} onChange={e => setCommentNome(e.target.value)} placeholder="Seu nome (opcional)" className="h-10 rounded-xl border bg-white px-3 text-sm" />
                                        <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} placeholder="Escreve um comentário..." className="rounded-xl border bg-white p-3 text-sm" />
                                        <button onClick={sendComment} className="self-end rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white">Comentar</button>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {comments.map((c: any) => (
                                            <div key={c.id} className="rounded-2xl border bg-white p-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[13px] font-semibold">{c.nome} <span className="ml-2 text-[11px] font-normal text-slate-400">{new Date(c.created_at).toLocaleDateString('pt-AO')}</span></p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setEditingId(c.id); setEditText(c.conteudo); }} className="text-xs text-slate-500 hover:text-black">Editar</button>
                                                        <button onClick={() => deleteComment(c.id)} className="text-xs text-red-500 hover:text-red-700">Apagar</button>
                                                    </div>
                                                </div>
                                                {editingId === c.id ? (
                                                    <div className="mt-2 flex gap-2"><input value={editText} onChange={e => setEditText(e.target.value)} className="flex-1 rounded-xl border px-3 py-2 text-sm" /><button onClick={() => updateComment(c.id)} className="rounded-full bg-black px-4 text-xs font-bold text-white">Salvar</button><button onClick={() => setEditingId(null)} className="rounded-full border px-4 text-xs">Cancelar</button></div>
                                                ) : (
                                                    <p className="mt-2 text-sm leading-6 text-slate-600 wrap-break-word">{c.conteudo}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-2">
                                    <button onClick={share} className="rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold text-white">WhatsApp</button>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://connect-uuo9.onrender.com/post/${post.slug || post.id}`)}`} target="_blank" className="rounded-full bg-[#1877F2] px-5 py-3 text-xs font-bold text-white">Facebook</a>
                                    <Link href="/" className="rounded-full border px-5 py-3 text-xs font-bold">Voltar</Link>
                                </div>
                            </div>
                        </div>

                        {related.length > 0 && (
                            <div className="mt-12">
                                <div className="flex items-center gap-3"><span className="h-px w-8 bg-sky-600" /><h3 className="text-xs font-bold uppercase tracking-widest text-sky-800">Relacionados</h3></div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {related.map((r: any) => (
                                        <Link key={r.id} href={`/post/${r.slug || r.id}`} className="flex gap-4 rounded-2xl border bg-slate-50 p-3 hover:shadow-md">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white border"><img src={r.thumbnail_url || r.media_url} className="h-full w-full object-cover" alt="" /></div>
                                            <div className="min-w-0"><p className="line-clamp-2 text-[13px] font-semibold">{r.titulo}</p><p className="mt-1 text-[11px] text-slate-500">👁 {r.views || 0}</p></div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    <aside className="col-span-12 lg:col-span-4 space-y-6">
                        {bannerSidebar && <div className="overflow-hidden rounded-2xl border bg-white p-3"><a href={bannerSidebar.link_url} target="_blank"><img src={bannerSidebar.imagem_url} alt="" className="w-full rounded-xl" /></a></div>}
                        <div className="rounded-2xl border bg-white p-6"><h4 className="text-[11px] font-bold uppercase tracking-widest text-sky-800">Sobre</h4><div className="mt-4 space-y-3 text-xs"><p className="flex justify-between"><span className="text-slate-400">Categoria</span><span className="font-semibold">{cat?.nome || 'Geral'}</span></p><p className="flex justify-between"><span className="text-slate-400">Likes</span><span className="font-semibold">👍 {likes} • 👎 {dislikes}</span></p><p className="flex justify-between"><span className="text-slate-400">Comentários</span><span className="font-semibold">{comments.length}</span></p></div></div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    );
}
