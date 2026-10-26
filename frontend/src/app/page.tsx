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
    categoria?: { nome: string }
    preco?: number | null;
    preco_promocional?: number | null;
    estoque?: number;
    sku?: string;
    em_promocao?: boolean;
    link_url?: string;
    tags?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getBanners(): Promise<Banner[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return [] }
}
async function getPosts(): Promise<Post[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/posts?status=published&limit=50`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch { return [] }
}
async function getPlataformas(): Promise<Post[]> {
    try {
        // busca só os tipos que importam pra seção - já bate com o teu routes.py ajustado
        const res = await fetch(`${API_BASE}/api/v1/posts?tipo=plataforma,app,site,sistema,saas,case,projeto&status=published&limit=20`, { next: { revalidate: 60 } });
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
    const produtos = posts.filter(p => p.tipo === 'produto' || p.tipo === 'product').slice(0, 8)
    return (
        <section id="produtos" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-10 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p>
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                        Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                    </p>
                </div>
                {produtos.length === 0 ? (
                    <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white border text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-12 flex snap-x snap-mandatory gap-0 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {produtos.map((item: any) => {
                            const cat = (item.category?.nome || item.categoria?.nome || 'PRODUTO').toUpperCase()
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/produto/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            return (
                                <Link key={item.id} href={link} className="group flex w-full min-w-full snap-center flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:shadow-md lg:min-w-0" style={{ minWidth: '100%' }}>
                                    <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '4 / 3' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                        {emPromo && <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">PROMO</span>}
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <span className="text-xs font-bold uppercase tracking-widest text-sky-600">{cat}</span>
                                        <h3 className="mt-2 text-sm font-semibold text-slate-800">{item.titulo}</h3>
                                        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-slate-500">{item.descricao || ''}</p>
                                        {item.preco && <div className="mt-4 text-sm font-bold">{emPromo ? <><span className="text-red-600">{formatKz(item.preco_promocional)}</span> <span className="text-xs line-through text-slate-400">{formatKz(item.preco)}</span></> : <span>{formatKz(item.preco)}</span>}</div>}
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-sky-600">Ver detalhes <span>→</span></span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <style>{`#produtos div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}

function PlataformasSection({ plataformas }: { plataformas: Post[] }) {
    const lista = plataformas

    return (
        <section id="plataformas" className="bg-slate-900 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-sky-400" />
                            <p className="text-xs font-bold uppercase tracking-widest text-sky-400">NOSSAS PLATAFORMAS</p>
                        </div>
                        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Apps e sites que criamos e mantemos.</h2>
                        <p className="mt-4 text-sm leading-6 text-slate-400">Da ideia ao deploy. Produtos próprios em produção e projetos entregues para clientes em Angola.</p>
                    </div>
                </div>

                {lista.length === 0 ? (
                    <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/50 py-20 text-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-800 border border-slate-700 text-slate-500">💻</div>
                        <p className="mt-4 text-sm font-semibold text-white">sem App, SaaS ou site disponível</p>
                        <p className="mt-1 max-w-sm text-xs text-slate-400">Cadastre no admin com tipo plataforma, app, site, saas ou case. Eles aparecem aqui automaticamente.</p>
                    </div>
                ) : (
                    <div
                        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}
                    >
                        {lista.map((item: any) => {
                            const isCase = item.tipo === 'case' || item.categoria?.nome?.toLowerCase().includes('case') || item.category?.nome?.toLowerCase().includes('case') || (item.tags && item.tags[0]?.toLowerCase().includes('case'))
                            const tagPrincipal = isCase ? 'CASE CLIENTE' : 'PRODUTO CONNECT'
                            const tagSec = item.tags?.find((t: string) => t.toUpperCase() !== tagPrincipal) || (item.tipo?.toUpperCase()) || (isCase ? 'SITE' : 'SAAS')
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const hasExternalLink = !!item.link_url
                            const href = hasExternalLink ? item.link_url! : `/plataforma/${item.slug || item.id}`

                            return (
                                <Link
                                    key={item.id}
                                    href={href}
                                    target={hasExternalLink ? '_blank' : undefined}
                                    className="group relative flex w-[85%] min-w-[85%] snap-center flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-800/50 transition-all hover:-translate-y-1 hover:bg-slate-800 sm:w-full sm:min-w-0 lg:min-w-0"
                                >
                                    <div className="relative w-full overflow-hidden bg-slate-800" style={{ aspectRatio: '16 / 10' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent" />
                                        <div className="absolute left-4 top-4 flex gap-2">
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${isCase ? 'bg-white text-slate-900' : 'bg-sky-500 text-white'}`}>{tagPrincipal}</span>
                                            <span className="rounded-full bg-slate-900/70 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-white">{tagSec}</span>
                                        </div>
                                        {!isCase && <span className="absolute bottom-4 left-4 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white">● ATIVO</span>}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="text-base font-semibold text-white group-hover:text-sky-300 line-clamp-1">{item.titulo}</h3>
                                        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-slate-400">{item.descricao || ''}</p>
                                        <div className="mt-5 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white">{isCase ? 'Ver case completo' : 'Explorar plataforma'} →</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <style>{`#plataformas div::-webkit-scrollbar{display:none}`}</style>
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
    const noticias = posts.filter(p => p.tipo === 'noticia').slice(0, 8)
    if (noticias.length === 0) return null
    return (
        <section id="noticias" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-600">NOTÍCIAS E MÍDIA</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-4xl">Últimas atualizações da empresa.</h2>
                <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                    {noticias.map(post => {
                        const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
                        const img = post.thumbnail_url || post.media_url || "/connect.png"
                        return (
                            <Link key={post.id} href={`/post/${post.slug || post.id}`} className="group flex w-[85%] min-w-[85%] snap-center shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-lg sm:w-full sm:min-w-0 lg:min-w-0">
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
    const [banners, posts, plataformas] = await Promise.all([getBanners(), getPosts(), getPlataformas()])
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

            <ProdutosSection posts={posts} />
            <PlataformasSection plataformas={plataformas} />
            <div id="parcerias"><ParceriasSection /></div>
            <NoticiasSection posts={posts} />
            <EquipeSection />
            <Footer />
        </main>
    )
}
