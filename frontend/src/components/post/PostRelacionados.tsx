// components/post/RelatedPosts.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RelatedPost = {
    id: string;
    slug?: string;
    titulo: string;
    thumbnail_url?: string;
    media_url?: string;
    views?: number;
    category_id?: string;
};

type Props = {
    posts?: RelatedPost[]; // mantém compatível, mas não usa mais como principal
    categoryId?: string;
    currentPostId?: string;
};

export default function PostRelacionados({ posts: initialPosts, categoryId, currentPostId }: Props) {
    const [posts, setPosts] = useState<RelatedPost[]>(initialPosts?.slice(0, 4) || []);

    useEffect(() => {
        if (!categoryId) return;

        // Busca SOMENTE da mesma categoria
        fetch(`${API}/api/v1/posts?category_id=${categoryId}&limit=8`)
            .then((r) => r.json())
            .then((data: any[]) => {
                const filtered = data
                    .filter((p: any) => p.id !== currentPostId) // remove o atual
                    .filter((p: any) => p.category_id === categoryId || !p.category_id || true) // garante categoria
                    .slice(0, 4);
                if (filtered.length > 0) setPosts(filtered);
            })
            .catch(() => { });
    }, [categoryId, currentPostId]);

    // Fallback: se ainda veio via props, garante que é da mesma categoria se tiver category_id no objeto
    const limited = posts
        .filter((p) => {
            if (!categoryId) return true;
            if (!p.category_id) return true; // se API não retorna category_id, aceita (já veio filtrado da API)
            return p.category_id === categoryId;
        })
        .slice(0, 4);

    if (limited.length === 0) return null;

    return (
        <div className="mt-14">
            <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">Notícias relacionadas</h3>
                <button
                    aria-label="Ver todas"
                    className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-xs transition hover:bg-black hover:text-white"
                >
                    ▶
                </button>
                <span className="text-xs text-slate-500">Play all</span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
                {limited.map((r) => (
                    <Link key={r.id} href={`/post/${r.slug || r.id}`} className="group">
                        <div className="mx-auto h-30 w-30 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition group-hover:ring-4 group-hover:ring-black/10 sm:h-42 sm:w-42 lg:h-46 lg:w-46">
                            <img
                                src={r.thumbnail_url || r.media_url || "/placeholder.jpg"}
                                alt={r.titulo}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-4 text-center sm:text-left">
                            <p className="line-clamp-2 text-sm font-bold leading-tight text-slate-900 group-hover:underline">
                                {r.titulo}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {Number(r.views || 0).toLocaleString("pt-AO")} visualizações
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <Link
                    href={categoryId ? `/?categoria=${categoryId}` : "/"}
                    className="flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline"
                >
                    Ver todas relacionadas <span>›</span>
                </Link>
            </div>
        </div>
    );
}
