import { getPosts, getApps } from '@/lib/api'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ConnectTVSection } from '@/components/ConnectPlayer'

type Category = { id: string; nome: string; slug: string; cor?: string }
type Post = { id: string; titulo: string; slug?: string; descricao?: string; tipo: string; thumbnail_url?: string; media_url?: string; category_id?: string; views?: number; created_at: string; destaque?: boolean; status: string; }
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: string; }

async function getCategories(): Promise<Category[]> { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/categories`, { next: { revalidate: 60 } }); if (!res.ok) return []; return await res.json() } catch { return [] } }
async function getBanners(): Promise<Banner[]> { try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } }); if (!res.ok) return []; return await res.json() } catch { return [] } }

function isVideoPost(post: Post) { const url = (post.media_url || '').toLowerCase(); return post.tipo === 'video' || url.includes('.mp4') || url.includes('video/upload') }
function isAudioPost(post: Post) { const url = (post.media_url || '').toLowerCase(); return post.tipo === 'audio' || post.tipo === 'musica' || url.includes('.mp3') }

function PostCard({ post, cat }: { post: Post, cat?: Category }) {
    return (
        <Link href={`/post/${post.slug || post.id}`} className="group block overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="aspect-16/10 bg-zinc-100 relative overflow-hidden">
                {post.thumbnail_url || post.media_url ? <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full grid place-items-center bg-[#0f172a] text-white font-bold text-xs">{post.tipo.toUpperCase()}</div>}
                {cat && <span className="absolute left-3 top-3 rounded-full bg-white border px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: cat.cor || '#0e8ac2' }}>{cat.nome}</span>}
            </div>
            <div className="p-5"><h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[#1e293b] group-hover:text-[#0e8ac2]">{post.titulo}</h3>{post.descricao && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748b]">{post.descricao}</p>}<div className="mt-3 flex items-center gap-2"><span className="rounded-full border bg-[#f8fafc] px-2.5 py-1 text-xs">{(post as any).views ?? 0} views</span><span className="text-xs text-[#94a3b8]">{new Date(post.created_at).toLocaleDateString('pt-AO')}</span></div></div>
        </Link>
    )
}
function BannerSlot({ banner, pos }: { banner?: Banner, pos: string }) {
    if (!banner) return null
    return (<div className="my-8"><p className="mb-2 px-1 text-[10px] tracking-widest text-zinc-400">PUBLICIDADE • {pos.toUpperCase()}</p><a href={banner.link_url} target={banner.link_url ? "_blank" : undefined} className="block overflow-hidden rounded-2xl border bg-white"><img src={banner.imagem_url} alt={banner.titulo} className="h-auto w-full object-cover max-h-40 md:max-h-55" /></a></div>)
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
    const heroBanner = bannerTopo
    const principalCat = categories.find(c => c.id === principal?.category_id)
    const heroBg = heroBanner?.imagem_url || "https://files.cdn-files-a.com/uploads/12300315/2000_6a73745adc7ea.png?format=avif"
    const heroKicker = principalCat?.nome?.toUpperCase() || "INOVAMOS PARA LIDERAR"
    const heroTitle = principal?.titulo || heroBanner?.titulo || "Uami Ndongadas - AULA 2"
    const heroDesc = principal?.descricao || "Connect-TICS é uma plataforma de tecnologia dedicada a levar notícias, apps e inovação para todo o país."

    return (
        <main className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
            <Header />
            <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-[#f1f5f9] px-5 pb-20 pt-32 sm:px-8 lg:pt-36" style={{ backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm sm:hidden" />
                <div className="absolute inset-0 hidden bg-linear-to-r from-white via-white/90 to-white/10 sm:block" />
                <div className="relative mx-auto w-full max-w-7xl"><div className="max-w-2xl"><div className="flex items-center gap-3"><span className="hidden h-px w-8 bg-[#0e8ac2] sm:block" /><p className="text-xs font-bold uppercase tracking-widest text-[#0e8ac2]">{heroKicker}</p></div><h1 className="mt-5 line-clamp-3 text-4xl font-semibold leading-none tracking-tight text-[#1e293b] sm:text-6xl lg:text-6xl">{heroTitle}</h1><p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-[#64748b]">{heroDesc}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={principal ? `/post/${principal.slug || principal.id}` : (heroBanner?.link_url || "#destaques")} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0e8ac2] px-7 text-sm font-semibold text-white">Explorar Tecnologias</Link><Link href="#categorias" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-7 text-sm font-semibold text-[#334155]">Contact Us</Link></div></div></div>
            </section>
            <div className="px-5 sm:px-8">
                <BannerSlot banner={bannerTopo} pos="home_topo" />
                <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 pb-16 pt-8 lg:gap-8">
                    <div className="col-span-12 lg:col-span-8">
                        <section id="destaques" className="mb-12"><div className="mb-8 flex items-end justify-between"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0e8ac2]"><span className="h-px w-6 bg-[#0e8ac2]" /> DESTAQUES</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Notícias em destaque hoje.</h2></div><Link href="/posts" className="text-xs font-semibold text-[#64748b]">Ver todos →</Link></div><div className="grid gap-6 md:grid-cols-3">{recentes.slice(0, 3).map(p => <PostCard key={p.id} post={p} cat={categories.find(c => c.id === p.category_id)} />)}</div></section>
                        <BannerSlot banner={bannerMeio} pos="home_meio" />
                        <div id="categorias">{postsByCategory.map(({ cat, posts }) => (<section key={cat.id} className="mb-12"><div className="mb-6 flex items-center gap-3"><span className="h-2 w-2 rounded-full" style={{ background: cat.cor || '#0e8ac2' }} /><h2 className="text-xs font-bold uppercase tracking-widest">{cat.nome}</h2><div className="ml-2 h-px flex-1 bg-[#e2e8f0]" /><Link href={`/categoria/${cat.slug}`} className="text-xs font-semibold text-[#64748b]">Ver tudo</Link></div><div className="grid gap-6 sm:grid-cols-2">{posts.map(p => <PostCard key={p.id} post={p} cat={cat} />)}</div></section>))}</div>
                        {videos.length > 0 && <div id="videos"><ConnectTVSection videos={videos} /></div>}
                    </div>
                    <div className="col-span-12 space-y-6 lg:col-span-4">
                        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm"><h3 className="mb-5 text-xs font-bold tracking-widest">MAIS LIDOS • 24H</h3><div className="space-y-4">{maisLidos.map((p, i) => (<Link key={p.id} href={`/post/${p.slug || p.id}`} className="flex gap-3 group"><span className="text-2xl font-black leading-none text-[#e2e8f0] group-hover:text-[#1e293b]">{String(i + 1).padStart(2, '0')}</span><div><p className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-[#0e8ac2]">{p.titulo}</p></div></Link>))}</div></div>
                        {bannerSidebar && <BannerSlot banner={bannerSidebar} pos="sidebar" />}
                        <div id="apps" className="rounded-3xl border border-[#e2e8f0] bg-white p-6"><h3 className="mb-4 text-xs font-bold tracking-widest">NOSSOS APPS</h3><div className="grid gap-3">{apps.slice(0, 6).map((a: any) => (<div key={a.id} className="flex items-center justify-between rounded-2xl bg-[#0f172a] p-4 text-white"><div><h4 className="text-sm font-bold">{a.nome}</h4><p className="text-xs opacity-60">{a.status || 'ativo'}</p></div><span>→</span></div>))}</div></div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    )
}
