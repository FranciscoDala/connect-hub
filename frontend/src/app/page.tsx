import { getPosts, getApps } from '@/lib/api'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

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

async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return [] }
}

function ParceriasSection() {
  return (
    <section className="bg-[#f8fafc] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#0e8ac2]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#0e8ac2]">PARCERIAS ESTRATÉGICAS</p>
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#1e293b] sm:text-5xl">Colabore para o Futuro.</h2>
          <p className="mt-6 text-sm leading-7 text-[#64748b] sm:text-base sm:leading-8">
            Colaboramos ativamente com organizações de tecnologia, instituições de pesquisa, empresas de software e investidores estratégicos em todo o mundo para acelerar a inovação tecnológica e expandir o acesso global às nossas soluções.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-10 w-10 place-items-center text-[#0e8ac2]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path d="M4 8a2 2 0 0 1 2-2h2V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2h-2V8H4v2H2V8a2 2 0 0 1 2-2ZM2 12h2v6a2 2 0 0 0 2 2h2v-8H2v0ZM10 12v8h4v-8h-4ZM16 12v8h2a2 2 0 0 0 2-2v-6h-4Z"/><path d="M12 7.5a1 1 0 1 0 2 1 1 0 0 0 0-2Z" /></svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#1e293b]">Integração Corporativa</h3>
            <p className="mt-1.5 text-xs text-[#94a3b8]">Empresas e Provedores de Tecnologia</p>
          </div>

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-10 w-10 place-items-center text-[#0e8ac2]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><rect x="4" y="4" width="5" height="3" rx="1"/><rect x="15" y="4" width="5" height="3" rx="1"/><rect x="9.5" y="14" width="5" height="3" rx="1"/><path d="M6.5 7v3.5c0 2 2 3.5 5.5 3.5S17.5 12.5 17.5 10.5V7"/><path d="M12 14v-2.5"/></svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#1e293b]">Distribuição Global</h3>
            <p className="mt-1.5 text-xs text-[#94a3b8]">Distribuidores Regionais de Tecnologia</p>
          </div>

          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-10 w-10 place-items-center text-[#0e8ac2]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path d="M3 4v16h18"/><path d="M7 16l4-4 3 2 5-6"/><path d="M15 8h4v4"/></svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#1e293b]">Estratégia de Investimento</h3>
            <p className="mt-1.5 text-xs text-[#94a3b8]">Capital de Risco e Private Equity</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function Home() {
    const banners = await getBanners()
    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    const hasBanner = !!bannerTopo

    const heroBg = hasBanner ? bannerTopo.imagem_url : "https://files.cdn-files-a.com/uploads/12300315/2000_6a73745adc7ea.png?format=avif"
    const heroTitle = hasBanner ? bannerTopo.titulo : "Uami Ndongadas - AULA 2"
    const heroDesc = hasBanner ? (bannerTopo.descricao || bannerTopo.conteudo || bannerTopo.subtitulo || "") : "Connect-TICS é uma plataforma de tecnologia dedicada a levar notícias, apps e inovação para todo o país."
    const heroLink = hasBanner ? (bannerTopo.link_url || "#parcerias") : "#parcerias"
    const heroKicker = hasBanner ? (bannerTopo.subtitulo || "DESTAQUE") : "INOVAMOS PARA LIDERAR"

    return (
        <main className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
            <Header />

            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-[#f1f5f9] pb-20 pt-32 lg:pt-36" style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm sm:hidden" />
                <div className="absolute inset-0 hidden bg-linear-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3"><span className="hidden h-px w-8 bg-[#0e8ac2] sm:block" /><p className="text-xs font-bold uppercase tracking-widest text-[#0e8ac2]">{heroKicker}</p></div>
                        <h1 className="mt-5 line-clamp-3 text-4xl font-semibold leading-none tracking-tight text-[#1e293b] sm:text-6xl">{heroTitle}</h1>
                        {heroDesc && <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-[#64748b]">{heroDesc}</p>}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={heroLink} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0e8ac2] px-7 text-sm font-semibold text-white">Explorar Tecnologias</Link>
                            <Link href="#parcerias" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-7 text-sm font-semibold text-[#334155]">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>

            <div id="parcerias">
              <ParceriasSection />
            </div>

            <Footer />
        </main>
    )
}
