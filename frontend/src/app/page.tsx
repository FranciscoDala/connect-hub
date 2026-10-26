import { getPosts, getApps } from '@/lib/api'
import Header from '@/components/Header'
import Link from 'next/link'
import { ConnectTVSection } from '@/components/ConnectPlayer'

type Category = { id: string; nome: string; slug: string; cor?: string }
type Post = {
    id: string; titulo: string; slug?: string; descricao?: string;
    tipo: string; thumbnail_url?: string; media_url?: string;
    category_id?: string; views?: number; comments_count?: number; shares_count?: number;
    created_at: string; destaque?: boolean; status: string;
}
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: string; ativo?: boolean }

async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/categories`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        return await res.json()
    } catch { return [] }
}
async function getBanners(): Promise<Banner[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        return await res.json()
    } catch { return [] }
}

function isVideoPost(post: Post) {
    const url = (post.media_url || '').toLowerCase()
    return post.tipo === 'video' || url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video/upload')
}
function isAudioPost(post: Post) {
    const url = (post.media_url || '').toLowerCase()
    return post.tipo === 'audio' || post.tipo === 'musica' || url.includes('.mp3')
}

function PostCard({ post, cat }: { post: Post, cat?: Category }) {
    return (
        <Link href={`/post/${post.slug || post.id}`} className="group overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-1 block">
            <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
                {post.thumbnail_url || post.media_url ? (
                    <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-500" />
                ) : (
                    <div className="w-full h-full grid place-items-center bg-[#0f172a] text-white font-bold text-xs">{post.tipo?.toUpperCase()}</div>
                )}
                {cat && <span className="absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full bg-white border shadow-sm uppercase tracking-wide" style={{ color: cat.cor || '#0e8ac2' }}>{cat.nome}</span>}
            </div>
            <div className="p-5">
                <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-[#0e8ac2] transition text-[14px] text-[#1e293b]">{post.titulo}</h3>
                {post.descricao && <p className="text-[12px] text-[#64748b] line-clamp-2 mt-2 leading-relaxed">{post.descricao}</p>}
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] bg-[#f8fafc] border px-2.5 py-1 rounded-full">👁 {(post as any).views ?? 0}</span>
                    <span className="text-[11px] text-[#94a3b8]">{new Date(post.created_at).toLocaleDateString('pt-AO')}</span>
                </div>
            </div>
        </Link>
    )
}

function BannerSlot({ banner, pos }: { banner?: Banner, pos: string }) {
    if (!banner) return null
    return (
        <div className="my-8">
            <p className="text-[10px] tracking-widest text-zinc-400 mb-2 px-1">PUBLICIDADE • {pos.toUpperCase()}</p>
            <a href={banner.link_url} target={banner.link_url ? "_blank" : undefined} className="block w-full rounded-[16px] overflow-hidden border bg-white">
                <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-auto object-cover max-h-[160px] md:max-h-[220px]" />
            </a>
        </div>
    )
}

export default async function Home() {
    const [postsRaw, apps, categories, banners] = await Promise.all([getPosts(), getApps(), getCategories(), getBanners()])
    const posts: Post[] = (Array.isArray(postsRaw) ? postsRaw : []).filter((p: any) => p.status === 'published')
    const destaques = posts.filter(p => (p as any).destaque).slice(0, 4)
    const principal = destaques[0] || posts[0]
    const maisLidos = [...posts].sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0)).slice(0, 5)
    const videos = posts.filter(p => isVideoPost(p) || isAudioPost(p)).slice(0, 6)
    const recentes = posts.slice(0, 8)
    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    const bannerMeio = banners.find(b => b.posicao === 'home_meio')
    const bannerSidebar = banners.find(b => b.posicao === 'sidebar')
    const postsByCategory = categories.map(cat => ({ cat, posts: posts.filter(p => p.category_id === cat.id).slice(0, 4) })).filter(g => g.posts.length > 0)

    // HERO CARREGA DO BANNER - IGUAL SEU ADMIN
    const heroBanner = bannerTopo // vem do cadastro: titulo, imagem_url, link_url, posicao home_topo
    const principalCat = categories.find(c => c.id === principal?.category_id)
    const heroBg = heroBanner?.imagem_url || "https://files.cdn-files-a.com/uploads/12300315/2000_6a73745adc7ea.png?format=avif"
    const heroKicker = principalCat?.nome?.toUpperCase() || "INOVAMOS PARA LIDERAR"
    const heroTitle = principal?.titulo || heroBanner?.titulo || "Uami Ndongadas - AULA 2 (Áudio)"
    const heroDesc = principal?.descricao || "Connect-TICS é uma plataforma de tecnologia dedicada a levar notícias, apps e inovação para todo o país, com curadoria, velocidade e compliance global."

    return (
        <main className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
            <Header />

            {/* HERO - CARREGA DA CATEGORIA/BANNER */}
            <section className="relative isolate min-h-[88vh] overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:pt-36 flex items-center bg-[#f1f5f9]"
                style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] sm:hidden z-[-1]" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 hidden sm:block z-[-1]" />

                <div className="mx-auto w-full max-w-7xl z-10">
                    <div className="max-w-[640px]">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-[#0e8ac2] hidden sm:block" />
                            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0e8ac2]">{heroKicker}</p>
                        </div>
                        <h1 className="mt-5 text-[34px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#1e293b] sm:text-6xl lg:text-[58px] line-clamp-3" style={{ fontFamily: "var(--font-montserrat)" }}>
                            {heroTitle}
                        </h1>
                        <p className="mt-5 max-w-[520px] text-[14px] leading-7 text-[#64748b] line-clamp-3">
                            {heroDesc}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href={principal ? `/post/${principal.slug || principal.id}` : (heroBanner?.link_url || "#destaques")} className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0e8ac2] px-7 text-white text-[14px] font-semibold shadow-[0_8px_20px_rgba(14,138,194,0.25)] hover:bg-[#0c709e] transition">Explorar Tecnologias</Link>
                            <Link href="#categorias" className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-7 text-[#334155] text-[14px] font-semibold shadow-sm hover:border-[#0e8ac2] transition">Contact Us</Link>
                        </div>
                        {principalCat && (
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white border px-3 py-1.5 text-[11px] font-semibold shadow-sm">
                                <span className="w-2 h-2 rounded-full" style={{ background: principalCat.cor || '#0e8ac2' }} /> {principalCat.nome} {heroBanner ? `• ${heroBanner.posicao}` : ''}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="px-5 sm:px-8">
                <BannerSlot banner={bannerTopo} pos="home_topo" />
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-8 pb-16 pt-8">
                    <div className="col-span-12 lg:col-span-8">
                        <section id="destaques" className="mb-12">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0e8ac2] flex items-center gap-2"><span className="h-px w-6 bg-[#0e8ac2]"/> DESTAQUES</p>
                                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-montserrat)" }}>Notícias em destaque hoje.</h2>
                                </div>
                                <Link href="/posts" className="text-[12px] font-semibold text-[#64748b] hover:text-black">Ver todos →</Link>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">{recentes.slice(0, 3).map(p => <PostCard key={p.id} post={p} cat={categories.find(c => c.id === p.category_id)} />)}</div>
                        </section>

                        <BannerSlot banner={bannerMeio} pos="home_meio" />

                        <div id="categorias">
                            {postsByCategory.map(({ cat, posts }) => (
                                <section key={cat.id} className="mb-12">
                                    <div className="flex items-center gap-3 mb-6"><span className="w-2 h-2 rounded-full" style={{ background: cat.cor || '#0e8ac2' }} /><h2 className="text-[12px] font-bold tracking-[0.2em] uppercase">{cat.nome}</h2><div className="h-px flex-1 bg-[#e2e8f0] ml-2" /><Link href={`/categoria/${cat.slug}`} className="text-[11px] font-semibold text-[#64748b]">Ver tudo</Link></div>
                                    <div className="grid sm:grid-cols-2 gap-6">{posts.map(p => <PostCard key={p.id} post={p} cat={cat} />)}</div>
                                </section>
                            ))}
                        </div>
                        {videos.length > 0 && <div id="videos"><ConnectTVSection videos={videos} /></div>}
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white border border-[#e2e8f0] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
                            <h3 className="text-[11px] font-bold tracking-widest mb-5">MAIS LIDOS • 24H</h3>
                            <div className="space-y-4">
                                {maisLidos.map((p, i) => (
                                    <Link key={p.id} href={`/post/${p.slug || p.id}`} className="flex gap-3 group"><span className="text-[22px] font-black text-[#e2e8f0] group-hover:text-[#1e293b] leading-none">{String(i + 1).padStart(2, '0')}</span><div className="min-w-0"><p className="text-[13px] font-medium leading-tight line-clamp-2 group-hover:text-[#0e8ac2]">{p.titulo}</p><p className="text-[11px] text-[#94a3b8] mt-1">👁 {(p as any).views || 0}</p></div></Link>
                                ))}
                            </div>
                        </div>
                        {bannerSidebar && <BannerSlot banner={bannerSidebar} pos="sidebar" />}
                        <div id="apps" className="bg-white border border-[#e2e8f0] rounded-[24px] p-6">
                            <h3 className="text-[11px] font-bold tracking-widest mb-4">NOSSOS APPS</h3>
                            <div className="grid gap-3">
                                {apps.slice(0, 6).map((a: any) => (
                                    <div key={a.id} className="p-4 rounded-2xl bg-[#0f172a] text-white flex justify-between items-center"><div><h4 className="font-bold text-[13px]">{a.nome}</h4><p className="text-[11px] opacity-60">{a.status || 'ativo'}</p></div><span>→</span></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
