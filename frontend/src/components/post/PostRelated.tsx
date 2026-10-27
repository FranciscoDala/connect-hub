"use client";
import { useEffect, useState } from "react";
import Link from 'next/link'

type Post = any

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getClientId() {
    if (typeof window === "undefined") return "anon";
    let id = localStorage.getItem("connect_client_id");
    if (!id) {
        id = Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem("connect_client_id", id);
    }
    return id;
}

function formatKz(v?: number | null) {
    if (v === null || v === undefined) return null
    return Number(v).toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz'
}

export default function ProdutosRelated({ posts }: { posts: Post[] }) {
    const [likedMap, setLikedMap] = useState<Record<string, string>>({});

    const produtos = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && (tipo === 'produto' || tipo === 'product')
        })
        .slice(0, 8)

    useEffect(() => {
        if (produtos.length === 0) return;
        const cid = getClientId();
        produtos.forEach((prod: any) => {
            fetch(`${API}/api/v1/posts/${prod.id}/reaction?client_id=${cid}`)
                .then(r => r.json())
                .then(d => {
                    if (d.user_reaction) {
                        setLikedMap(prev => ({ ...prev, [prod.id]: d.user_reaction }));
                    }
                })
                .catch(() => { });
        });
    }, [posts]);

    return (
        <section id="produtos" className="py-2 sm:py-28">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">NOSSOS PRODUTOS</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2>

                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                    Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                </p>

                {produtos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none' }}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            const cat = item.category?.nome || 'Produto'
                            const isLiked = likedMap[item.id] === 'like';

                            return (
                                <Link
                                    key={item.id}
                                    href={link}
                                    className="group flex w-full min-w-70 max-w-90 shrink-0 snap-center flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:-translate-y-1 lg:min-w-0 lg:max-w-none lg:w-full"
                                >
                                    {/* IMAGEM QUADRADA 1/1 COM CORAÇÃO */}
                                    <div className="relative w-full shrink-0 overflow-hidden rounded-t-3xl" style={{ backgroundColor: '#ffd88f', aspectRatio: '1 / 1' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover" />

                                        {/* CORAÇÃO VERMELHO SE JÁ CURTIU */}
                                        {isLiked && (
                                            <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow backdrop-blur">
                                                <svg className="h-5 w-5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTEUDO */}
                                    <div className="flex flex-1 flex-col px-5 pb-4 pt-4" style={{ backgroundColor: '#fffcf5' }}>
                                        <h3 className="text-sm font-bold leading-snug wrap-break-word" style={{ color: '#1f1f1f' }}>{item.titulo}</h3>
                                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs text-neutral-600">{emPromo ? 'PROMO' : 'NOVO'}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <style>{`#produtos div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}
