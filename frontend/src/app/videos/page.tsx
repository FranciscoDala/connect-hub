"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PER_PAGE = 8;

export default function VideosPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/api/v1/posts?limit=100`);
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                const videos = list.filter((p: any) => {
                    const status = (p.status || '').toLowerCase();
                    const tipo = (p.tipo || '').toLowerCase().trim();
                    return status === 'published' && ['video','videos','connect tv','connect_tv'].includes(tipo);
                });
                setPosts(videos);
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
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">Connect TV</p>
                </div>
                <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Connect TV.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                    Vídeos, tutoriais e demonstrações dos nossos produtos em ação. {posts.length} vídeo(s) publicado(s).
                </p>

                {loading ? (
                    <div className="mt-10 grid place-items-center py-20">
                        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-black"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">▶</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem vídeos disponíveis</p>
                        <p className="mt-1 text-xs text-slate-400">Novos vídeos em breve</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {posts.length > 0 && currentPosts.map((item: any) => {
                                const img = item.thumbnail_url || item.media_url || '/connect.png';
                                const link = `/post/${item.slug || item.id}`;
                                return (
                                    <Link key={item.id} href={link} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:-translate-y-1">
                                        <div className="relative w-full shrink-0 overflow-hidden bg-black aspect-square">
                                            <img src={img} alt={item.titulo} className="h-full w-full object-cover transition group-hover:scale-105" />
                                            <div className="absolute inset-0 grid place-items-center">
                                                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-sm shadow backdrop-blur transition group-hover:scale-110">▶</span>
                                            </div>
                                            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700 shadow backdrop-blur">
                                                VÍDEO
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
                                            <h3 className="text-sm font-bold leading-snug wrap-break-word whitespace-normal line-clamp-3 text-slate-800">
                                                {item.titulo}
                                            </h3>
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 wrap-break-word">
                                                {item.descricao || 'Assista este vídeo da CONNECT.'}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between pt-4">
                                                <span className="text-xs text-slate-400">Connect TV</span>
                                                <span className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white">Assistir</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} onClick={() => goToPage(page)} className={`grid size-9 place-items-center rounded-full text-xs font-bold transition ${currentPage === page ? 'bg-sky-600 text-white shadow-lg' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{page}</button>
                                ))}
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
