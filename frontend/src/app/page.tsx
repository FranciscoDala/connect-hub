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

function ParceriasSection() {
    return (
        <section className="bg-slate-50 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">PARCERIAS ESTRATÉGICAS</p>
                        <span className="h-px w-8 bg-sky-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">Colabore para o Futuro.</h2>
                    <p className="mt-6 text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                        Colaboramos ativamente com organizações de tecnologia, instituições de pesquisa, empresas de software e investidores estratégicos em todo o mundo para acelerar a inovação tecnológica e expandir o acesso global às nossas soluções.
                    </p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto grid h-10 w-10 place-items-center text-sky-600">🏢</div>
                        <h3 className="mt-3 text-sm font-semibold text-slate-800">Integração Corporativa</h3>
                        <p className="mt-1.5 text-xs text-slate-400">Empresas e Provedores de Tecnologia</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto grid h-10 w-10 place-items-center text-sky-600">🌐</div>
                        <h3 className="mt-3 text-sm font-semibold text-slate-800">Distribuição Global</h3>
                        <p className="mt-1.5 text-xs text-slate-400">Distribuidores Regionais de Tecnologia</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto grid h-10 w-10 place-items-center text-sky-600">📈</div>
                        <h3 className="mt-3 text-sm font-semibold text-slate-800">Estratégia de Investimento</h3>
                        <p className="mt-1.5 text-xs text-slate-400">Capital de Risco e Private Equity</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

function formatKz(v?: number | null) {
    if (v === null || v === undefined) return null
    return Number(v).toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz'
}

function ProdutosSection({ posts }: { posts: Post[] }) {
    const produtosReais = posts.filter(p => p.status === 'published' && (p.tipo === 'produto' || p.tipo === 'product')).slice(0, 8)

    const mock = [
        { id: '1', categoria: 'REABILITAÇÃO', titulo: 'ExoRehab Pro', desc: 'Exoesqueleto robótico avançado projetado para acelerar a recuperação motora e restaurar a mobilidade.', img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600', preco: null, preco_promocional: null },
        { id: '2', categoria: 'NEUROCIRURGIA', titulo: 'NeuroNav Elite', desc: 'Sistema de navegação robótica de alta precisão para procedimentos neurocirúrgicos minimamente invasivos e complexos.', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600', preco: null, preco_promocional: null },
        { id: '3', categoria: 'CUIDADOS INTENSIVOS', titulo: 'ECMO RespiraCare', desc: 'Ventilador de última geração e sistema completo de suporte à vida para unidades de terapia intensiva.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600', preco: null, preco_promocional: null },
        { id: '4', categoria: 'ONCOLOGIA', titulo: 'ProBeam Oncology', desc: 'Sistema de terapia de prótons de última geração que fornece radiação ultraprecisa para atingir tumores específicos.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600', preco: null, preco_promocional: null },
    ]

    const usarMock = produtosReais.length === 0
    const lista: any[] = usarMock ? mock : produtosReais

    return (
        <section id="produtos" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-10 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p>
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-700 sm:text-4xl">Sistemas Médicos Avançados.</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                        Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                    </p>
                </div>

                <div
                    className="mt-12 flex snap-x snap-mandatory gap-0 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}
                >
                    {lista.map((item: any) => {
                        const isMock = usarMock
                        const cat = isMock ? item.categoria : (item.category?.nome || 'PRODUTO').toUpperCase()
                        const titulo = item.titulo
                        const desc = isMock ? item.desc : (item.descricao || '')
                        const img = isMock ? item.img : (item.thumbnail_url || item.media_url || '/connect.png')
                        const link = isMock ? '#produtos' : `/produto/${item.slug || item.id}`
                        const preco = isMock ? null : item.preco
                        const promo = isMock ? null : item.preco_promocional
                        const temPreco = preco != null
                        const emPromo = item.em_promocao && promo != null

                        return (
                            <Link
                                key={item.id}
                                href={link}
                                className="group flex w-full min-w-full snap-center flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:shadow-md lg:min-w-0"
                                style={{ minWidth: '100%' }}
                            >
                                <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '4 / 3' }}>
                                    <img src={img} alt={titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                    {emPromo && <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">PROMO</span>}
                                    {isMock === false && item.estoque === 0 && <span className="absolute right-3 top-3 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-white">ESGOTADO</span>}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <span className="text-xs font-bold uppercase tracking-widest text-sky-600">{cat}</span>
                                    <h3 className="mt-2 text-sm font-semibold text-slate-800">{titulo}</h3>
                                    <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-slate-500">{desc}</p>

                                    {temPreco && (
                                        <div className="mt-4">
                                            {emPromo ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-red-600">{formatKz(promo)}</span>
                                                    <span className="text-xs line-through text-slate-400">{formatKz(preco)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-slate-800">{formatKz(preco)}</span>
                                            )}
                                        </div>
                                    )}

                                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-sky-600">
                                        {temPreco ? 'Ver detalhes' : 'Solicite um orçamento'} <span>→</span>
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <style>{`#produtos div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}

function EquipeSection() {
    return (
        <section id="equipe" className="bg-slate-100 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">LIDERANÇA</p>
                        <span className="h-px w-8 bg-sky-600" />
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">CEO</h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Guiados por décadas de experiência na indústria de tecnologia, logística global e conformidade regulatória internacional.</p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-6">
                    <div className="flex w-full max-w-sm flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                        <div className="mx-auto overflow-hidden rounded-full border-4 border-white shadow" style={{ width: '200px', height: '200px' }}>
                            <img src="/team/ceo.jpeg" alt="CEO" className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-base font-semibold text-slate-800">Francisco J.M Dala</h3>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-sky-600">DIRETOR EXECUTIVO - CEO</p>
                        </div>
                        <div className="mt-4 space-y-3 text-justify text-xs leading-6 text-slate-500">
                            <p>Francisco Dala é o Fundador e CEO da Connect Tics. Com formação em Engenharia Informática e mais de 5 anos de liderança em tecnologia em Angola, fundou a empresa em 2021 combinando visão global de negócios com profundo conhecimento do mercado local.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function NoticiasSection({ posts }: { posts: Post[] }) {
    const noticias = posts.filter(p => p.status === 'published' && p.tipo === 'noticia').slice(0, 8)
    if (noticias.length === 0) return null
    return (
        <section id="noticias" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-600">NOTÍCIAS E MÍDIA</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-4xl">Últimas atualizações da empresa.</h2>
                <div className="mt-10 flex snap-x snap-mandatory gap-0 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                    {noticias.map(post => {
                        const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
                        const img = post.thumbnail_url || post.media_url || "/connect.png"
                        return (
                            <Link key={post.id} href={`/post/${post.slug || post.id}`} className="group flex w-full min-w-full snap-center shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-lg lg:min-w-0" style={{ minWidth: '100%' }}>
                                <div className="w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '16 / 10' }}>
                                    <img src={img} alt={post.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <span className="text-xs font-medium text-sky-600">{dataFormatada}</span>
                                    <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-slate-800 group-hover:text-sky-600">{post.titulo}</h3>
                                    {post.descricao && (<p className="mt-3 line-clamp-3 text-justify text-xs leading-5 text-slate-500">{post.descricao}</p>)}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <style>{`#noticias div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
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
                <div className="absolute inset-0 hidden bg-gradient-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3"><span className="hidden h-px w-8 bg-sky-600 sm:block" /><p className="text-xs font-bold uppercase tracking-widest text-sky-600">{heroKicker}</p></div>
                        <h1 className="mt-5 line-clamp-3 text-4xl font-semibold leading-none tracking-tight text-slate-800 sm:text-6xl">{heroTitle}</h1>
                        {heroDesc && <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-slate-500">{heroDesc}</p>}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={heroLink} className="inline-flex min-h-12 items-center justify-center rounded-full bg-sky-600 px-7 text-sm font-semibold text-white">Explorar Produtos</Link>
                            <Link href="#equipe" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700">Nossa Equipe</Link>
                        </div>
                    </div>
                </div>
            </section>

            <ProdutosSection posts={posts} />
            <div id="parcerias"><ParceriasSection /></div>
            <NoticiasSection posts={posts} />
            <EquipeSection />
            <Footer />
        </main>
    )
}
