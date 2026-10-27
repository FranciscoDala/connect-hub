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

            <div className="mt-6 flex gap-3 overflow-x-auto overflow-y-visible px-2 py-3 sm:grid sm:grid-cols-4 sm:gap-8 sm:overflow-visible sm:p-0 sm:pt-6 [&::-webkit-scrollbar]:hidden">
                {limited.map((r) => (
                    <Link
                        key={r.id}
                        href={`/post/${r.slug || r.id}`}
                        className="group flex flex-none w-[48%] flex-col items-center sm:w-auto"
                    >
                        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:ring-4 group-hover:ring-black/10 sm:h-40 sm:w-40 lg:h-46 lg:w-46">
                            <img
                                src={r.thumbnail_url || r.media_url || "/placeholder.jpg"}
                                alt={r.titulo}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-4 w-full px-1 text-center">
                            <p className="text-sm font-bold leading-tight text-slate-900 group-hover:underline">
                                {r.titulo}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {Number(r.views || 0).toLocaleString("pt-AO")} visualizações
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-2 flex justify-end">
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
