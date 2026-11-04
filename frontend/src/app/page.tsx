"use client"

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import ParceriasSection from '@/components/seccoes/ParceriasSection'
import ProdutosSection from '@/components/seccoes/ProdutosSection'
import PlataformasSection from '@/components/seccoes/PlataformasSection'
import EquipeSection from '@/components/seccoes/EquipeSection'
import NoticiasSection from '@/components/seccoes/NoticiasSection'
import EventosSection from '@/components/seccoes/EventosSection'
import CeoSection from '@/components/public/ceo-section'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://connect-backend-iern.onrender.com'
const DEFAULT_HERO_BG = 'https://files.cdn-files-a.com/uploads/12300315/2000_6a73745adc7ea.png?format=avif'

type Banner = {
    id: string;
    titulo: string;
    descricao?: string;
    conteudo?: string;
    subtitulo?: string;
    imagem_url: string;
    link_url?: string;
    posicao: string;
}

type Post = {
    id: string;
    titulo: string;
    slug?: string;
    descricao?: string;
    conteudo?: string;
    tipo: string;
    thumbnail_url?: string;
    media_url?: string;
    created_at: string;
    status: string;
    category?: { nome: string }
    preco?: number | null;
    preco_promocional?: number | null;
    estoque?: number;
    sku?: string;
    em_promocao?: boolean;
    link_url?: string;
    tags?: string[];
}

// AJUSTE: normaliza o tipo para não falhar se vier "Produto", "produtos", "product", etc.
function normalizarTexto(v?: string) {
    return (v || '').toLowerCase().trim()
}

function temPostDoTipo(posts: Post[], palavras: string[]) {
    return posts.some((p) => {
        const status = normalizarTexto(p.status)
        // Não conta rascunho / inativo como post válido para mostrar a secção
        if (['rascunho', 'draft', 'inativo', 'inactive', 'arquivado'].includes(status)) return false
        const tipo = normalizarTexto(p.tipo)
        const categoria = normalizarTexto(p.category?.nome)
        return palavras.some((palavra) => tipo.includes(palavra) || categoria.includes(palavra))
    })
}

function SkeletonCard({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded-[20px] border border-slate-200 bg-slate-200/80 ${className}`} />
}

function HomeSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-slate-100 pb-20 pt-32 lg:pt-36">
                <div className="absolute inset-0 bg-slate-200/90" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-300" />
                        <div className="mt-5 h-12 w-full max-w-xl animate-pulse rounded-xl bg-slate-300 sm:h-16" />
                        <div className="mt-5 h-5 w-full max-w-lg animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-5 w-3/4 max-w-md animate-pulse rounded bg-slate-200" />
                        <div className="mt-8 flex gap-3">
                            <div className="h-12 w-40 animate-pulse rounded-full bg-slate-300" />
                            <div className="h-12 w-44 animate-pulse rounded-full bg-slate-200" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#f9f9f7] py-10 sm:py-16">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mb-6 h-4 w-40 animate-pulse rounded-full bg-slate-300" />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonCard key={index} className="h-[280px]" />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-10 sm:py-16">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mb-6 h-4 w-48 animate-pulse rounded-full bg-slate-300" />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <SkeletonCard key={index} className="h-[280px]" />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#0f172a] py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="h-6 w-60 animate-pulse rounded-full bg-slate-700" />
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <SkeletonCard key={index} className="h-[260px] bg-slate-700/80" />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

async function getHomeData() {
    const [bannersRes, postsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/banners?ativo=true`, { cache: 'no-store' }),
        fetch(`${API_URL}/api/v1/posts`, { cache: 'no-store' }),
    ])

    const [banners, posts] = await Promise.all([
        bannersRes.ok ? bannersRes.json() : [],
        postsRes.ok ? postsRes.json() : [],
    ])

    return {
        banners: Array.isArray(banners) ? banners : [],
        posts: Array.isArray(posts) ? posts : [],
    }
}

export default function Home() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const fetchHomeData = async () => {
            try {
                const data = await getHomeData()
                if (!isMounted) return
                setBanners(data.banners)
                setPosts(data.posts)
            } catch {
                if (!isMounted) return
                setBanners([])
                setPosts([])
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchHomeData()

        const interval = window.setInterval(() => {
            fetchHomeData()
        }, 15000)

        const handleVisibility = () => {
            if (!document.hidden) fetchHomeData()
        }

        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            isMounted = false
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [])

    if (loading && banners.length === 0 && posts.length === 0) {
        return <HomeSkeleton />
    }

    const bannerTopo = banners.find((b) => b.posicao === 'home_topo')
    const heroBg = bannerTopo?.imagem_url || DEFAULT_HERO_BG
    const heroTitle = bannerTopo?.titulo || 'CONNECT'
    const heroDesc = bannerTopo ? (bannerTopo.descricao || bannerTopo.conteudo || bannerTopo.subtitulo || '') : 'Agência digital focada em desenvolvimento de software, sites e aplicativos que geram resultados reais para empresas em Angola.'
    const heroKicker = bannerTopo?.subtitulo || 'INOVAMOS PARA LIDERAR'

    // AJUSTE PRINCIPAL: cada secção só aparece se tiver pelo menos 1 post válido daquele tipo
    const temEventos = temPostDoTipo(posts, ['evento', 'event', 'festa'])
    const temProdutos = temPostDoTipo(posts, ['produto', 'product'])
    const temPlataformas = temPostDoTipo(posts, ['plataforma', 'platform', 'app', 'aplicativo'])
    const temNoticias = temPostDoTipo(posts, ['noticia', 'news', 'blog', 'artigo'])

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-slate-100 pb-16 pt-28 lg:pt-36" style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-linear-to-b from-white via-white/85 to-white/25 backdrop-blur-[1px] sm:hidden" />
                <div className="absolute inset-0 hidden bg-linear-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="w-full max-w-85 sm:max-w-xl lg:max-w-150">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-sky-600" />
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-600 sm:text-xs">{heroKicker}</p>
                        </div>
                        <h1 className="mt-3 w-full text-left text-[28px] font-semibold tracking-tight leading-[1.1] text-slate-800 sm:mt-4 sm:text-4xl sm:leading-[1.05] lg:text-[42px] lg:leading-[1.08]">{heroTitle}</h1>
                        {heroDesc && (
                            <p className="mt-3 w-full text-left text-[14px] leading-5 text-slate-500 sm:text-[15px] sm:leading-6 line-clamp-4">{heroDesc}</p>
                        )}

                        <div className="mt-5 flex flex-row items-center gap-2">
                            <Link href="/tecnologia" className="inline-flex h-9 items-center justify-center rounded-full bg-sky-600 px-5 text-[11px] font-semibold text-white sm:min-h-10 sm:px-6 sm:text-[13px]">Explorar Produtos</Link>
                            <Link href="/apps" className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[11px] font-semibold text-slate-700 sm:min-h-10 sm:px-6 sm:text-[13px]">Nossas Plataformas</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Secções dependentes de posts: só aparecem se tiver post */}
            {temEventos && <EventosSection posts={posts} />}
            {temProdutos && <ProdutosSection posts={posts} />}
            {temPlataformas && <PlataformasSection posts={posts} />}

            {/* Estas ficam sempre, não dependem de post */}
            <div id="parcerias"><ParceriasSection /></div>
            {temNoticias && <NoticiasSection posts={posts} />}
            <EquipeSection />
            <CeoSection />
            <Footer />
        </main>
    )
}
