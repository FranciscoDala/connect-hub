// app/post/[slug]/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostComments from "@/components/post/PostComments";
import PostRelacionados from "@/components/post/PostRelacionados";
import PostSidebar from "@/components/post/PostSidebar";

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
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                let res = await fetch(`${API}/api/v1/posts/slug/${slug}`);
                if (!res.ok) res = await fetch(`${API}/api/v1/posts/${slug}`);
                if (!res.ok) {
                    const all = await fetch(`${API}/api/v1/posts?limit=100`).then((r) => r.json());
                    const found = all.find((p: any) => p.slug === slug || p.id === slug);
                    if (found) {
                        setPost(found);
                        setLikes(found.likes_count || 0);
                        setDislikes(found.dislikes_count || 0);
                    } else {
                        setLoading(false);
                        return;
                    }
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
        const cid = getClientId();
        fetch(`${API}/api/v1/posts/${post.id}/view`, { method: "POST" }).catch(() => { });
        fetch(`${API}/api/v1/posts/${post.id}/reaction?client_id=${cid}`)
            .then((r) => r.json())
            .then((d) => setMyReaction(d.user_reaction))
            .catch(() => { });
        fetch(`${API}/api/v1/categories`).then((r) => r.json()).then(setCategories).catch(() => { });
        fetch(`${API}/api/v1/banners?ativo=true`).then((r) => r.json()).then(setBanners).catch(() => { });
        if (post.category_id) {
            fetch(`${API}/api/v1/posts?category_id=${post.category_id}&limit=8`)
                .then((r) => r.json())
                .then((d: any[]) => setRelated(d.filter((p) => p.id !== post.id).slice(0, 8)))
                .catch(() => { });
        }
    }, [post]);

    async function react(type: "like" | "dislike") {
        const client_id = getClientId();
        const res = await fetch(`${API}/api/v1/posts/${post.id}/reaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, client_id }),
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
            if (navigator.share) await navigator.share({ title: post.titulo, url });
            else {
                await navigator.clipboard.writeText(url);
                alert("Link copiado!");
            }
            fetch(`${API}/api/v1/posts/${post.id}/share`, { method: "POST" }).catch(() => { });
        } catch { }
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
                <div className="flex items-center gap-2 text-xs">
                    <Link href="/" className="text-slate-400">INÍCIO</Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold uppercase tracking-widest text-sky-700">{cat?.nome || post.tipo}</span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    <article className="col-span-12 lg:col-span-8">
                        <div className="overflow-hidden shadow-sm">
                            {(post.thumbnail_url || post.media_url) && <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="max-h-140 w-full object-cover rounded-none" />}
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="h-px w-7 bg-sky-600" />
                                    <span className="font-bold uppercase tracking-widest text-sky-800">{cat?.nome || post.tipo}</span>
                                    <span className="ml-auto text-slate-400">{new Date(post.created_at).toLocaleDateString("pt-AO")}</span>
                                </div>
                                <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{post.titulo}</h1>
                                {post.descricao && <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{post.descricao}</p>}
                                {isProduto && post.preco && <div className="mt-5 text-2xl font-bold">{formatKz(post.preco_promocional || post.preco)}</div>}
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <button onClick={() => react("like")} className={`h-9 rounded-full border px-4 text-xs font-semibold ${myReaction === "like" ? "border-black bg-black text-white" : "bg-white hover:bg-slate-50"}`}>👍 {likes}</button>
                                    <button onClick={() => react("dislike")} className={`h-9 rounded-full border px-4 text-xs font-semibold ${myReaction === "dislike" ? "bg-black text-white" : "bg-white"}`}>👎 {dislikes}</button>
                                    <button onClick={share} className="h-9 rounded-full border bg-white px-4 text-xs">↗ Partilhar</button>
                                    <span className="ml-auto self-center text-xs text-slate-500">👁 {post.views || 0} • 💬 {commentCount}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 p-6 sm:p-8">
                                {mostrarConteudo && (
                                    <div className="prose max-w-none prose-p:text-sm prose-p:leading-7 prose-p:text-slate-600 sm:prose-p:text-base">
                                        <div dangerouslySetInnerHTML={{ __html: post.conteudo }} />
                                    </div>
                                )}

                                {bannerDentro && <div className="mt-8 rounded-xl border bg-slate-50 p-3"><a href={bannerDentro.link_url} target="_blank"><img src={bannerDentro.imagem_url} className="w-full rounded-lg" alt="" /></a></div>}

                                <PostComments postId={post.id} onCountChange={setCommentCount} />

                                <div className="mt-10 flex gap-2">
                                    <button onClick={share} className="h-10 rounded-full bg-green-500 px-5 text-xs font-bold text-white">WhatsApp</button>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://connect-uuo9.onrender.com/post/${post.slug || post.id}`)}`} target="_blank" className="grid h-10 place-items-center rounded-full bg-blue-600 px-5 text-xs font-bold text-white">Facebook</a>
                                    <Link href="/" className="grid h-10 place-items-center rounded-full border px-5 text-xs font-bold">Voltar</Link>
                                </div>
                            </div>
                        </div>

                        <PostRelacionados categoryId={post.category_id} currentPostId={post.id} posts={related} />
                    </article>

                    <PostSidebar postId={post.id} categoryId={post.category_id} />
                </div>
            </div>
            <Footer />
        </main>
    );
}
