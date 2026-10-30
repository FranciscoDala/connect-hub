"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PER_PAGE = 6;
const TIPOS_PLATAFORMA = ['plataforma','app','site','sistema','saas','case','projeto','telecom'];

function getTipoLabel(tipo: string) {
    return (tipo || 'APP').toUpperCase();
}

function getTipoStyle(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('app') || t.includes('plataforma')) return 'bg-violet-600 text-white'
    if (t.includes('site') || t.includes('sistema')) return 'bg-sky-600 text-white'
    return 'bg-black text-white'
}

export default function AppsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/api/v1/posts?limit=100`);
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                const apps = list.filter((p: any) => {
                    const status = (p.status || '').toLowerCase();
                    const tipo = (p.tipo || '').toLowerCase().trim();
                    return status === 'published' && TIPOS_PLATAFORMA.includes(tipo);
                });
                setPosts(apps);
            } catch {}
            setLoading(false);
        })();
    }, []);

    const totalPages = Math.ceil(posts.length / PER_PAGE);
    const currentPosts = posts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    function goToPage(page: number) {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <main className="min-h-screen bg-stone-50">
            <Header />
            <div className="mx-auto max-w-7xl px-5 pt-24 pb-20 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APPS</p>
                </div>
                <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Nossos Apps.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                    Baixe os aplicativos oficiais da CONNECT e tenha controle total dos seus equipamentos. {posts.length} publicado(s).
                </p>

                {loading ? (
                    <div className="mt-10 grid place-items-center py-20">
                        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-black"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">📱</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem apps disponíveis</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {currentPosts.map((item: any) => {
                                const img = item.thumbnail_url || item.media_url || '/connect.png';
                                const link = `/post/${item.slug || item.id}`;
                                const views = item.views ?? item.views_count ?? 0
                                const likes = item.likes_count ?? item.likes ?? 0
                                const emUtilizacao = item.em_utilizacao || item.status_plataforma === 'em_utilizacao';
                                const tipoLabel = getTipoLabel(item.tipo);
                                const tipoStyle = getTipoStyle(item.tipo);

                                return (
                                    <Link key={item.id} href={link} className="group relative flex flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:shadow-lg">
                                        {/* IMAGEM + BADGES */}
                                        <div className="relative w-full shrink-0 overflow-hidden bg-zinc-100" style={{ aspectRatio: '16 / 10' }}>
                                            <img src={img} alt={item.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />

                                            {/* ESQUERDA - CATEGORIA + STATUS */}
                                            <div className="absolute left-2 top-2 flex items-center gap-1.5">
                                                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest ${tipoStyle}`}>
                                                    {tipoLabel}
                                                </span>
                                                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold text-white shadow ${emUtilizacao ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                    {emUtilizacao ? 'EM USO' : 'EM DEV'}
                                                </span>
                                            </div>

                                            {/* DIREITA - LIKES */}
                                            {likes > 0 && (
                                                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow backdrop-blur">
                                                    <svg className="size-3.5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                    {likes}
                                                </span>
                                            )}
                                        </div>

                                        {/* CONTEÚDO */}
                                        <div className="flex flex-1 flex-col p-4">
                                            <div className="mb-2 flex items-center gap-1 text-[11px] text-zinc-500">
                                                <span>👁 {views} visualizações</span>
                                            </div>
                                            <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight text-zinc-900 group-hover:text-violet-600">
                                                {item.titulo}
                                            </h3>
                                            <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-zinc-500">
                                                {item.descricao || 'Baixe e gerencie seus dispositivos.'}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="rounded-full border bg-white px-4 py-2 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-40">← Anterior</button>
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button key={page} onClick={() => goToPage(page)} className={`size-8 grid place-items-center rounded-full text-xs font-bold transition ${currentPage === page ? 'bg-black text-white' : 'border bg-white text-zinc-600 hover:bg-zinc-50'}`}>{page}</button>
                                    ))}
                                </div>
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-full border bg-white px-4 py-2 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-40">Próximo →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
