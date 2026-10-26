import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import ParceriasSection from '@/components/seccoes/ParceriasSection'
import ProdutosSection from '@/components/seccoes/ProdutosSection'
import PlataformasSection from '@/components/seccoes/PlataformasSection'
import EquipeSection from '@/components/seccoes/EquipeSection'
import NoticiasSection from '@/components/seccoes/NoticiasSection'

type Banner = { id: string; titulo: string; descricao?: string; conteudo?: string; subtitulo?: string; imagem_url: string; link_url?: string; posicao: string; }
type Post = { id: string; titulo: string; slug?: string; descricao?: string; tipo: string; thumbnail_url?: string; media_url?: string; created_at: string; status: string; category?: { nome: string }; link_url?: string; tags?: string[]; preco?: number | null; }

async function getBanners(): Promise<Banner[]> { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } }); return res.ok ? await res.json() : []; } catch { return [] } }
async function getPosts(): Promise<Post[]> { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/posts`, { next: { revalidate: 60 } }); return res.ok ? await res.json() : []; } catch { return [] } }

export default async function Home() {
    const [banners, posts] = await Promise.all([getBanners(), getPosts()])
    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    const heroBg = bannerTopo?.imagem_url || "https://files.cdn-files-a.com/uploads/12300315/2000_6a73745adc7ea.png?format=avif"
    const heroTitle = bannerTopo?.titulo || "Inovamos para Liderar o Futuro"
    const heroDesc = bannerTopo?.descricao || "Connect-TICS é uma plataforma de tecnologia dedicada a levar soluções, inovação e transformação digital para Angola."

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-slate-100 pb-20 pt-32" style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-white/75 sm:hidden" /><div className="absolute inset-0 hidden bg-linear-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8"><h1 className="max-w-2xl text-4xl font-semibold sm:text-6xl">{heroTitle}</h1><p className="mt-5 max-w-xl text-sm text-slate-500">{heroDesc}</p><div className="mt-8 flex gap-3"><Link href="#produtos" className="rounded-full bg-sky-600 px-7 py-3 text-sm font-semibold text-white">Explorar Produtos</Link><Link href="#plataformas" className="rounded-full border bg-white px-7 py-3 text-sm font-semibold">Nossas Plataformas</Link></div></div>
            </section>
            <ProdutosSection posts={posts} />
            <PlataformasSection posts={posts} />
            <ParceriasSection />
            <NoticiasSection posts={posts} />
            <EquipeSection />
            <Footer />
        </main>
    )
}
