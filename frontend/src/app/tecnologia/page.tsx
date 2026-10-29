"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProdutosSection from "@/components/seccoes/ProdutosSection";
import NoticiasSection from "@/components/seccoes/NoticiasSection";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TecnologiaPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [postsRes, catsRes] = await Promise.all([
                    fetch(`${API}/api/v1/posts?limit=100`).then(r => r.json()),
                    fetch(`${API}/api/v1/categories`).then(r => r.json()).catch(() => [])
                ]);

                const cats = Array.isArray(catsRes) ? catsRes : [];
                const postsList = Array.isArray(postsRes) ? postsRes : [];
                const catMap = new Map(cats.map((c: any) => [c.id, c]));
                const catTec = cats.find((c: any) => (c.nome || c.slug || '').toLowerCase().includes('tecnolog'));

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

                if (filtrados.length === 0) {
                    filtrados = postsList.filter((p: any) => {
                        const status = (p.status || '').toLowerCase();
                        const tipo = (p.tipo || '').toLowerCase();
                        return status === 'published' && ['produto','product','noticia','news','tecnologia'].includes(tipo);
                    });
                }

                setPosts(filtrados);
            } catch {}
            setLoading(false);
        })();
    }, []);

    return (
        <main className="min-h-screen bg-stone-50">
            <Header />
            <div className="mx-auto max-w-7xl px-5 pt-24 pb-10 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">TECNOLOGIA</p>
                </div>
                <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Tecnologia de ponta.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                    Conheça os equipamentos e soluções inovadoras que a CONNECT traz para o mercado angolano. Produtos acima e notícias abaixo.
                </p>
            </div>

            {loading ? (
                <div className="py-20 grid place-items-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-black"></div>
                </div>
            ) : (
                <>
                    {/* PRODUTOS ACIMA - já com preço, scroll mobile 100% width, scrollbar invisível */}
                    <ProdutosSection posts={posts} />

                    {/* NOTICIAS ABAIXO */}
                    <NoticiasSection posts={posts} />
                </>
            )}

            <Footer />
        </main>
    );
}
