// components/post/PostSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PostMini = {
    id: string;
    slug?: string;
    titulo: string;
    descricao?: string;
    thumbnail_url?: string;
    media_url?: string;
    views?: number;
};

type Category = { id: string; nome: string; slug?: string };
type Banner = { imagem_url: string; link_url: string; posicao: string };

type Props = {
    postId: string;
    categoryId?: string;
};

export default function PostSidebar({ postId, categoryId }: Props) {
    const [tab, setTab] = useState<"recentes" | "lidas">("recentes");
    const [recentes, setRecentes] = useState<PostMini[]>([]);
    const [lidas, setLidas] = useState<PostMini[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [banner, setBanner] = useState<Banner | null>(null);

    useEffect(() => {
        fetch(`${API}/api/v1/posts?limit=12`)
            .then((r) => r.json())
            .then((data: any[]) => {
                const filtered = data.filter((p) => p.id !== postId);
                setRecentes(filtered.slice(0, 5));
                const sorted = [...filtered]
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 5);
                setLidas(sorted);
            })
            .catch(() => { });

        fetch(`${API}/api/v1/categories`)
            .then((r) => r.json())
            .then(setCategories)
            .catch(() => { });

        fetch(`${API}/api/v1/banners?ativo=true`)
            .then((r) => r.json())
            .then((all: Banner[]) => {
                const b = all.find((x) => x.posicao === "sidebar");
                if (b) setBanner(b);
            })
            .catch(() => { });
    }, [postId]);

    const list = tab === "recentes" ? recentes : lidas;

    return (
        <aside className="col-span-12 space-y-4 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            {/* 1. MAIS RECENTES / LIDAS */}
            <div className="overflow-hidden rounded-none shadow-0">
                <div className="flex items-center gap-6 border-b border-slate-100 pt-5">
                    <button
                        onClick={() => setTab("recentes")}
                        className={`relative pb-3 text-xs font-bold uppercase tracking-widest transition ${tab === "recentes" ? "text-sky-700" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Mais Recentes
                        {tab === "recentes" && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />}
                    </button>
                    <button
                        onClick={() => setTab("lidas")}
                        className={`relative pb-3 text-xs font-bold uppercase tracking-widest transition ${tab === "lidas" ? "text-sky-700" : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Mais Lidas
                        {tab === "lidas" && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-700" />}
                    </button>
                </div>

                <div>
                    {list.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">Carregando...</div>
                    ) : (
                        list.map((p) => (
                            <Link
                                key={p.id}
                                href={`/post/${p.slug || p.id}`}
                                className="group flex gap-4 border-b border-slate-100 py-4 last:border-0"
                            >
                                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                    <img
                                        src={p.thumbnail_url || p.media_url || "/placeholder.jpg"}
                                        alt={p.titulo}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800 group-hover:text-sky-700">
                                        {p.titulo}
                                    </h4>
                                    {p.descricao && (
                                        <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
                                            {p.descricao}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* 2. BANNER SIDEBAR - DINÂMICO */}
            {banner && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                        <img src={banner.imagem_url} alt="Publicidade" className="w-full rounded-xl" />
                    </a>
                    <p className="mt-2 text-center text-xs uppercase tracking-widest text-slate-400">Publicidade</p>
                </div>
            )}

        </aside>
    );
}
