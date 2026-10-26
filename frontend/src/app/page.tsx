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
                        <div className="mx-auto grid h-10 w-10 place-items-center text-[#0e8ac2]">🏢</div>
                        <h3 className="mt-3 text-sm font-semibold text-[#1e293b]">Integração Corporativa</h3>
                        <p className="mt-1.5 text-xs text-[#94a3b8]">Empresas e Provedores de Tecnologia</p>
                    </div>
                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto grid h-10 w-10 place-items-center text-[#0e8ac2]">🌐</div>
                        <h3 className="mt-3 text-sm font-semibold text-[#1e293b]">Distribuição Global</h3>
                        <p className="mt-1.5 text-xs text-[#94a3b8]">Distribuidores Regionais de Tecnologia</p>
                    </div>
                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto grid h-10 w-10 place-items-center text-[#0e8ac2]">📈</div>
                        <h3 className="mt-3 text-sm font-semibold text-[#1e293b]">Estratégia de Investimento</h3>
                        <p className="mt-1.5 text-xs text-[#94a3b8]">Capital de Risco e Private Equity</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

function EquipeSection() {
    return (
        <section id="equipe" className="bg-[#f1f5f9] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                {/* Header igual print */}
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-[#0e8ac2]" />
                            <p className="text-xs font-bold uppercase tracking-widest text-[#0e8ac2]">LIDERANÇA</p>
                        </div>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1e293b] sm:text-4xl">Conheça Nossa Equipe Executiva.</h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-[#64748b] sm:text-right">
                        Guiados por décadas de experiência na indústria de tecnologia, logística global e conformidade regulatória internacional.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-12 grid gap-6 sm:grid-cols-3">
                    {/* CEO */}
                    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-sm">
                        <div className="mx-auto h-50 w-50 overflow-hidden rounded-full border-4 border-white shadow">
                            <img src="/team/ceo.jpeg" alt="CEO" className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-base font-semibold text-[#1e293b]">Francisco J.M Dala</h3>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[#0e8ac2]">DIRETOR EXECUTIVO - CEO</p>
                        </div>
                        <div className="mt-4 space-y-3 text-xs leading-6 text-[#64748b]">
                            <p>
                                Francisco Dala é o Fundador e CEO da Connect Tics. Com formação em Engenharia Informática e mais de 5 anos de liderança em tecnologia em Angola, fundou a empresa em 2021 combinando visão global de negócios com profundo conhecimento do mercado local.
                            </p>
                            <p>
                                Como CEO, promove uma cultura de colaboração que guia a empresa na entrega de soluções de tecnologia avançada em todo o país, mantendo a reputação por identificar tecnologias emergentes à frente do mercado.
                            </p>
                        </div>
                    </div>

                    {/* VP Operations
                    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-sm">
                        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" alt="VP" className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-base font-semibold text-[#1e293b]">Sofia Mendes</h3>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[#0e8ac2]">VICE-PRESIDENTE DE OPERAÇÕES</p>
                        </div>
                        <div className="mt-4 space-y-3 text-xs leading-6 text-[#64748b]">
                            <p>
                                Sofia supervisiona as operações diárias da sede da Connect Tics. Trazendo quase uma década de experiência em liderança como Gerente Geral no sector de tecnologia, possui ampla experiência em administração, gestão de contas e redes de distribuição.
                            </p>
                            <p>
                                Desempenha um papel crucial na otimização de fluxos de trabalho, fortalecendo o atendimento ao cliente e garantindo operações de cadeia de suprimentos confiáveis, altamente eficientes para entregar serviços de qualidade.
                            </p>
                        </div>
                    </div>
                    */}

                    {/* CTO
                    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-7 shadow-sm">
                        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" alt="CTO" className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-base font-semibold text-[#1e293b]">David Park</h3>
                            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-[#0e8ac2]">DIRETOR DE TECNOLOGIA - CTO</p>
                        </div>
                        <div className="mt-4 space-y-3 text-xs leading-6 text-[#64748b]">
                            <p>
                                David traz mais de 10 anos de experiência em engenharia de sistemas, infraestrutura de alta frequência e design mecânico avançado. Com Mestrado em Engenharia de Sistemas pela Universidade Agostinho Neto, especializa-se em engenharia de precisão e otimização tecnológica.
                            </p>
                            <p>
                                Lidera as inovações técnicas da Connect Tics, aproveitando sua formação multidisciplinar para avançar nossa missão de entregar tecnologias confiáveis e de ponta para todo o país.
                            </p>
                        </div>
                    </div>
                    */}


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
    const heroTitle = hasBanner ? bannerTopo.titulo : "Inovamos para Liderar o Futuro"
    const heroDesc = hasBanner ? (bannerTopo.descricao || bannerTopo.conteudo || bannerTopo.subtitulo || "") : "Connect-TICS é uma plataforma de tecnologia dedicada a levar soluções, inovação e transformação digital para Angola."
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
                            <Link href="#equipe" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-7 text-sm font-semibold text-[#334155]">Nossa Equipe</Link>
                        </div>
                    </div>
                </div>
            </section>

            <div id="parcerias">
                <ParceriasSection />
            </div>

            <EquipeSection />

            <Footer />
        </main>
    )
}
