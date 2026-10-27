// app/post/[slug]/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostRelacionados from "@/components/post/PostRelacionados";
import PostSidebar from "@/components/post/PostSidebar";
import ProdutosSection from '@/components/seccoes/ProdutosSection'

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatKz(v?: number | null) {
    if (v == null) return null;
    return Number(v).toLocaleString("pt-AO") + " Kz";
}
function getClientId() {
    if (typeof window === "undefined") return "anon";
    let id = localStorage.getItem("connect_client_id");
    if (!id) {
        id = Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem("connect_client_id", id);
    }
    return id;
}
function isSameText(a?: string, b?: string) {
    if (!a || !b) return false;
    const clean = (s: string) => s.replace(/<[^>]*>/g, "").trim().toLowerCase();
    return clean(a) === clean(b);
}

export default function PostPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [post, setPost] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [myReaction, setMyReaction] = useState<string | null>(null);
    const [showHeart, setShowHeart] = useState(false);
    const [saved, setSaved] = useState(false);
    const lastTap = useRef(0);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                let res = await fetch(`${API}/api/v1/posts/slug/${slug}`);
                if (!res.ok) res = await fetch(`${API}/api/v1/posts/${slug}`);
                if (!res.ok) {
                    const all = await fetch(`${API}/api/v1/posts?limit=100`).then((r) => r.json());
                    const found = all.find((p: any) => p.slug === slug || p.id === slug);
                    if (found) { setPost(found); setLikes(found.likes_count || 0); setDislikes(found.dislikes_count || 0); }
                    else { setLoading(false); return; }
                } else { const data = await res.json(); setPost(data); setLikes(data.likes_count || 0); setDislikes(data.dislikes_count || 0); }
            } catch { } setLoading(false);
        })();
    }, [slug]);

    useEffect(() => {
        if (!post) return;
        const cid = getClientId();
        fetch(`${API}/api/v1/posts/${post.id}/view`, { method: "POST" }).catch(() => { });
        fetch(`${API}/api/v1/posts/${post.id}/reaction?client_id=${cid}`).then((r) => r.json()).then((d) => setMyReaction(d.user_reaction)).catch(() => { });
        fetch(`${API}/api/v1/categories`).then((r) => r.json()).then(setCategories).catch(() => { });
        fetch(`${API}/api/v1/banners?ativo=true`).then((r) => r.json()).then(setBanners).catch(() => { });
        if (post.category_id) { fetch(`${API}/api/v1/posts?category_id=${post.category_id}&limit=8`).then((r) => r.json()).then((d: any[]) => setRelated(d.filter((p) => p.id !== post.id).slice(0, 8))).catch(() => { }); }
    }, [post]);

    async function react(type: "like" | "dislike") {
        const client_id = getClientId();
        const res = await fetch(`${API}/api/v1/posts/${post.id}/reaction`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, client_id }), });
        if (res.ok) { const d = await res.json(); setLikes(d.likes_count); setDislikes(d.dislikes_count); setMyReaction(d.user_reaction); }
    }
    function triggerLike() { setShowHeart(true); setTimeout(() => setShowHeart(false), 900); if (myReaction !== "like") react("like"); }
    function handleDoubleClick() { triggerLike(); }
    function handleTouchEnd() { const now = Date.now(); if (now - lastTap.current < 300) triggerLike(); lastTap.current = now; }
    async function share() {
        const url = `https://connect-uuo9.onrender.com/post/${post.slug || post.id}`;
        try { if (navigator.share) await navigator.share({ title: post.titulo, url }); else { await navigator.clipboard.writeText(url); alert("Link copiado!"); } fetch(`${API}/api/v1/posts/${post.id}/share`, { method: "POST" }).catch(() => { }); } catch { }
    }

    if (loading) return <div className="min-h-screen grid place-items-center bg-white">Carregando...</div>;
    if (!post) return <div className="min-h-screen grid place-items-center">Post não encontrado</div>;

    const isProduto = ["produto", "product"].includes((post.tipo || "").toLowerCase());
    const cat = categories.find((c: any) => c.id === post.category_id);
    const bannerDentro = banners.find((b: any) => b.posicao === "dentro_post");
    const conteudoDuplicado = isSameText(post.descricao, post.conteudo);
    const mostrarConteudo = post.conteudo && !conteudoDuplicado;

    return (
        <main className="min-h-screen bg-stone-50 text-slate-800">
            <Header />
            <div className="mx-auto max-w-7xl px-5 pt-24 pb-4 sm:px-8">
                <div className="flex items-center gap-2 text-xs"><Link href="/" className="text-slate-400">INÍCIO</Link><span className="text-slate-300">/</span><span className="font-bold uppercase tracking-widest text-sky-700">{cat?.nome || post.tipo}</span></div>
            </div>
            <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    <article className="col-span-12 lg:col-span-8">
                        <div className="overflow-hidden rounded-none border-0">
                            {(post.thumbnail_url || post.media_url) && (
                                <div className="relative select-none cursor-pointer overflow-hidden bg-black" onDoubleClick={handleDoubleClick} onTouchEnd={handleTouchEnd}>
                                    <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="max-h-140 w-full object-cover" draggable={false} />
                                    {myReaction === "like" && (
                                        <div className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 shadow backdrop-blur">
                                            <svg className="size-5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                        </div>
                                    )}
                                    {showHeart && (
                                        <div className="pointer-events-none absolute inset-0 grid place-items-center">
                                            <svg className="size-28 animate-[igHeart_0.9s_ease-out_forwards] fill-red-600 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                        </div>
                                    )}
                                    <style>{`@keyframes igHeart { 0% { transform: scale(0); opacity: 0; } 15% { transform: scale(1.25); opacity: 1; } 30% { transform: scale(0.95); } 45%, 80% { transform: scale(1); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }`}</style>
                                </div>
                            )}

                            <div className="flex items-center gap-5 px-4 py-3">
                                <button onClick={() => react("like")} className="group">
                                    {myReaction === "like" ? (
                                        <svg className="size-6.5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    ) : (
                                        <svg className="size-6.5 fill-none stroke-black transition group-active:scale-90" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    )}
                                </button>

                                <button onClick={share} className="group">
                                    <svg className="size-6.5 transition group-active:scale-90" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                </button>

                                <button onClick={() => setSaved(!saved)} className="ml-auto">
                                    <svg className={`size-6.5 transition ${saved ? "fill-black" : "fill-none"} stroke-black`} strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V4z"/></svg>
                                </button>
                            </div>

                            <div className="px-4 pb-1">
                                <p className="text-sm font-semibold">{likes} curtidas</p>
                                <div className="mt-3 flex items-center gap-2 text-xs"><span className="h-px w-7 bg-sky-600" /><span className="font-bold uppercase tracking-widest text-sky-800">{cat?.nome || post.tipo}</span><span className="ml-auto text-slate-400">{new Date(post.created_at).toLocaleDateString("pt-AO")} • 👁 {post.views || 0}</span></div>
                                <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{post.titulo}</h1>
                                {post.descricao && <p className="mt-2 text-justify text-sm leading-6 text-slate-500 sm:text-[15px]">{post.descricao}</p>}
                                {isProduto && post.preco && <div className="mt-4 text-xl font-bold">{formatKz(post.preco_promocional || post.preco)}</div>}
                            </div>
                            <div className="border-t border-slate-100 p-4 sm:p-6">
                                {mostrarConteudo && <div className="prose max-w-none prose-p:text-justify prose-p:text-sm prose-p:leading-7 prose-p:text-slate-600 sm:prose-p:text-[15px]"><div dangerouslySetInnerHTML={{ __html: post.conteudo }} /></div>}
                                {bannerDentro && <div className="mt-6 rounded-xl border bg-slate-50 p-3"><a href={bannerDentro.link_url} target="_blank"><img src={bannerDentro.imagem_url} className="w-full rounded-lg" alt="" /></a></div>}
                            </div>
                        </div>

                        <PostRelacionados categoryId={post.category_id} currentPostId={post.id} posts={related} />

                        <ProdutosSection posts={related} />

                    </article>
                    <PostSidebar postId={post.id} categoryId={post.category_id} />
                </div>
            </div>
            <Footer />
        </main>
    );
}
