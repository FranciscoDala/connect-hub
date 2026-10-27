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
    posts?: RelatedPost[];
    categoryId?: string;
    currentPostId?: string;
};

export default function PostRelacionados({ posts: initialPosts, categoryId, currentPostId }: Props) {
    const [posts, setPosts] = useState<RelatedPost[]>(initialPosts?.slice(0, 4) || []);

    useEffect(() => {
        if (!categoryId) return;
        fetch(`${API}/api/v1/posts?category_id=${categoryId}&limit=8`)
            .then((r) => r.json())
            .then((data: any[]) => {
                const filtered = data.filter((p: any) => p.id !== currentPostId).slice(0, 4);
                if (filtered.length > 0) setPosts(filtered);
            })
            .catch(() => { });
    }, [categoryId, currentPostId]);

    const limited = posts
        .filter((p) => {
            if (!categoryId) return true;
            if (!p.category_id) return true;
            return p.category_id === categoryId;
        })
        .slice(0, 4);

    if (limited.length === 0) return null;

    return (
        <div className="mt-14">
            <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-sky-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-sky-800">RELACIONADOS</p>
            </div>

            {/* MOBILE: carrossel 2 por tela / DESKTOP: grid 4 */}
            <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-8 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                {limited.map((r) => (
                    <Link
                        key={r.id}
                        href={`/post/${r.slug || r.id}`}
                        className="group flex-none w-1/2 snap-start sm:w-auto sm:flex-auto"
                    >
                        <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition group-hover:ring-4 group-hover:ring-black/10 sm:h-40 sm:w-40 lg:h-46 lg:w-46">
                            <img
                                src={r.thumbnail_url || r.media_url || "/placeholder.jpg"}
                                alt={r.titulo}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-4 px-1 text-center sm:text-left">
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
