"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PER_PAGE = 6;

export default function EventosPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/api/v1/posts?limit=100`);
                const data = await res.json();
                const eventos = data.filter((p: any) => {
                    const status = (p.status || '').toLowerCase();
                    const tipo = (p.tipo || '').toLowerCase();
                    return status === 'published' && (tipo === 'evento' || tipo === 'event' || tipo === 'eventos');
                });
                setPosts(eventos);
            } catch {}
            setLoading(false);
        })();
    }, []);

    const totalPages = Math.ceil(posts.length / PER_PAGE);
    const start = (currentPage - 1) * PER_PAGE;
    const currentPosts = posts.slice(start, start + PER_PAGE);

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
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">EVENTOS</p>
                </div>
                <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Nossos próximos eventos.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                    Fique por dentro dos eventos, formações e lançamentos da CONNECT. Tecnologia, networking e inovação para elevar sua prática.
                </p>

                {loading ? (
                    <div className="mt-10 grid place-items-center py-20">
                        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-black"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">📅</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem eventos disponíveis no momento</p>
                        <p className="mt-1 text-xs text-slate-400">Novos eventos em breve</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {currentPosts.map((item: any) => {
                                const img = item.thumbnail_url || item.media_url || '/connect.png'
                                const link = `/post/${item.slug || item.id}`
                                const data = item.data_evento || item.created_at
                                return (
                                    <Link key={item.id} href={link} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:-translate-y-1">
                                        <div className="relative w-full shrink-0 overflow-hidden" style={{ aspectRatio: '1 / 1', backgroundColor: '#e0f2fe' }}>
                                            <img src={img} alt={item.titulo} className="h-full w-full object-cover transition group-hover:scale-105" />
                                            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-700 shadow backdrop-blur">
                                                {data ? new Date(data).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }) : 'EVENTO'}
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
                                            <h3 className="text-sm font-bold leading-snug wrap-break-word text-slate-800">{item.titulo}</h3>
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                                {item.descricao || 'Participe deste evento exclusivo da CONNECT.'}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between pt-4">
                                                <span className="text-xs text-slate-400">{item.local || 'Luanda, AO'}</span>
                                                <span className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white">Ver evento</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* PAGINAÇÃO */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ‹
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`grid size-9 place-items-center rounded-full text-xs font-bold transition ${
                                            currentPage === page
                                                ? 'bg-sky-600 text-white shadow-lg'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
