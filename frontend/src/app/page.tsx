import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

import ParceriasSection from '@/components/seccoes/ParceriasSection'
import ProdutosSection from '@/components/seccoes/ProdutosSection'
import PlataformasSection from '@/components/seccoes/PlataformasSection'
import EquipeSection from '@/components/seccoes/EquipeSection'
import NoticiasSection from '@/components/seccoes/NoticiasSection'
import EventosSection from '@/components/seccoes/EventosSection'
import CeoSection from '@/components/public/ceo-section'

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

async function getBanners(): Promise<Banner[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://connect-backend-iern.onrender.com'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return [] }
}
async function getPosts(): Promise<Post[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://connect-backend-iern.onrender.com'}/api/v1/posts`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return [] }
}

export default async function Home() {
    const [banners, posts] = await Promise.all([getBanners(), getPosts()])
    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    const hasBanner = !!bannerTopo
    const heroBg = hasBanner ? bannerTopo.imagem_url : "https://files.cdn-files-a.com/uploads/12300315/2000_6a73745adc7ea.png?format=avif"
    const heroTitle = hasBanner ? bannerTopo.titulo : "Inovamos para Liderar o Futuro"
    const heroDesc = hasBanner ? (bannerTopo.descricao || bannerTopo.conteudo || bannerTopo.subtitulo || "") : "Connect-TICS é uma plataforma de tecnologia dedicada a levar soluções, inovação e transformação digital para Angola."
    const heroKicker = hasBanner ? (bannerTopo.subtitulo || "DESTAQUE") : "INOVAMOS PARA LIDERAR"

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <Header />

            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-slate-100 pb-16 pt-28 lg:pt-36" style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-linear-to-b from-white via-white/85 to-white/25 backdrop-blur-[1px] sm:hidden" />
                <div className="absolute inset-0 hidden bg-linear-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-sky-600" />
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-600 sm:text-xs">
                                {heroKicker}
                            </p>
                        </div>
                        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-wrap-balance wrap-break-word leading-[1.1] text-slate-800 sm:mt-4 sm:text-4xl sm:leading-[1.05] lg:text-[42px]">
                            {heroTitle}
                        </h1>
                        {heroDesc && <p className="mt-2 max-w-[90%] text-[12px] leading-5 text-wrap-pretty wrap-break-word text-slate-500 sm:mt-3 sm:max-w-xl sm:text-sm sm:leading-6">{heroDesc}</p>}

                        <div className="mt-4 flex flex-row items-center gap-2 sm:mt-6">
                            <Link href="/tecnologia" className="inline-flex h-9 items-center justify-center rounded-full bg-sky-600 px-5 text-[11px] font-semibold text-white sm:min-h-10 sm:px-6 sm:text-[13px]">
                                Explorar Produtos
                            </Link>
                            <Link href="#plataformas" className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-[11px] font-semibold text-slate-700 sm:min-h-10 sm:px-6 sm:text-[13px]">
                                Nossas Plataformas
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <EventosSection posts={posts} />
            <ProdutosSection posts={posts} />
            <PlataformasSection posts={posts} />
            <div id="parcerias"><ParceriasSection /></div>
            <NoticiasSection posts={posts} />
            <EquipeSection />
            <CeoSection />
            <Footer />
        </main>
    )
}
