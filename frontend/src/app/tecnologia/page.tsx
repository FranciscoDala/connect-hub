"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PER_PAGE = 6;

export default function TecnologiaPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        (async () => {
            try {
                const [postsRes, catsRes] = await Promise.all([
                    fetch(`${API}/api/v1/posts?limit=100`).then(r => r.json()),
                    fetch(`${API}/api/v1/categories`).then(r => r.json()).catch(() => [])
                ]);

                const cats = Array.isArray(catsRes) ? catsRes : [];
                const postsList = Array.isArray(postsRes) ? postsRes : [];

                // cria mapa id -> categoria
                const catMap = new Map(cats.map((c: any) => [c.id, c]));
                const catTec = cats.find((c: any) =>
                    (c.nome || c.slug || '').toLowerCase().includes('tecnolog')
                );

                let filtrados = postsList.filter((p: any) => {
                    const status = (p.status || '').toLowerCase();
                    if (status !== 'published') return false;

                    const catById = catMap.get(p.category_id);
                    const nomeDaCategoria = (
                        catById?.nome ||
                        p.category?.nome ||
                        p.category_name ||
                        p.categoria?.nome ||
                        p.categoria_nome || ''
                    ).toLowerCase();

                    const isTecPorCategoria = nomeDaCategoria.includes('tecnolog');
                    const isTecPorId = catTec ? p.category_id === catTec.id : false;
                    const isTecPorTipo = (p.tipo || '').toLowerCase() === 'tecnologia';

                    return isTecPorCategoria || isTecPorId || isTecPorTipo;
                });

                // FALLBACK: se não achou nada na categoria, mostra todos produtos + noticias (pra não ficar vazio)
                if (filtrados.length === 0) {
                    filtrados = postsList.filter((p: any) => {
                        const status = (p.status || '').toLowerCase();
                        const tipo = (p.tipo || '').toLowerCase();
                        return status === 'published' && ['produto','product','noticia','news','tecnologia'].includes(tipo);
                    });
                }

                setPosts(filtrados);
            } catch (e) {
                console.error(e);
            }
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
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">TECNOLOGIA</p>
                </div>
                <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Tecnologia de ponta.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                    Conheça os equipamentos e soluções inovadoras que a CONNECT traz para o mercado angolano. Produtos e notícias da categoria tecnologia.
                </p>

                {loading ? (
                    <div className="mt-10 grid place-items-center py-20">
                        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-black"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">💡</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem conteúdos de tecnologia no momento</p>
                        <p className="mt-1 text-xs text-slate-400">Produtos e notícias em breve</p>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {currentPosts.map((item: any) => {
                                const img = item.thumbnail_url || item.media_url || '/connect.png';
                                const link = `/post/${item.slug || item.id}`;
                                const tipo = (item.tipo || 'PRODUTO').toUpperCase();
                                return (
                                    <Link key={item.id} href={link} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:-translate-y-1">
                                        <div className="relative w-full shrink-0 overflow-hidden bg-slate-100 aspect-square">
                                            <img src={img} alt={item.titulo} className="h-full w-full object-cover transition group-hover:scale-105" />
                                            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700 shadow backdrop-blur">
                                                {tipo}
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
                                            <h3 className="text-sm font-bold leading-snug wrap-break-word whitespace-normal line-clamp-3 text-slate-800">
                                                {item.titulo}
                                            </h3>
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 wrap-break-word">
                                                {item.descricao || 'Saiba mais sobre esta tecnologia.'}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between pt-4">
                                                <span className="text-xs text-slate-400">{item.category?.nome || 'Tecnologia'}</span>
                                                <span className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold text-white">Ver mais</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-40">‹</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} onClick={() => goToPage(page)} className={`grid size-9 place-items-center rounded-full text-xs font-bold transition ${currentPage === page ? 'bg-sky-600 text-white shadow-lg' : 'border border-slate-200 bg-white text-slate-600'}`}>{page}</button>
                                ))}
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 disabled:opacity-40">›</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
