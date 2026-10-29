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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return [] }
}
async function getPosts(): Promise<Post[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/posts`, { next: { revalidate: 60 } });
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
    const heroLink = hasBanner ? (bannerTopo.link_url || "#produtos") : "#produtos"
    const heroKicker = hasBanner ? (bannerTopo.subtitulo || "DESTAQUE") : "INOVAMOS PARA LIDERAR"

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-slate-100 pb-20 pt-32 lg:pt-36" style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm sm:hidden" />
                <div className="absolute inset-0 hidden bg-linear-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3"><span className="hidden h-px w-8 bg-sky-600 sm:block" /><p className="text-xs font-bold uppercase tracking-widest text-sky-600">{heroKicker}</p></div>
                        <h1 className="mt-5 line-clamp-3 text-4xl font-semibold leading-none tracking-tight text-slate-800 sm:text-6xl">{heroTitle}</h1>
                        {heroDesc && <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-slate-500">{heroDesc}</p>}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={heroLink} className="inline-flex min-h-12 items-center justify-center rounded-full bg-sky-600 px-7 text-sm font-semibold text-white">Explorar Produtos</Link>
                            <Link href="#plataformas" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700">Nossas Plataformas</Link>
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
