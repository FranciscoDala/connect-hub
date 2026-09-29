import { getPosts, getApps } from '@/lib/api'
import Header from '@/components/Header'
import Link from 'next/link'
import { ConnectTVSection } from '@/components/ConnectPlayer'

type Category = { id: string; nome: string; slug: string; cor?: string }
type Post = { id: string; titulo: string; slug?: string; descricao?: string; tipo: string; thumbnail_url?: string; media_url?: string; category_id?: string; views?: number; comments_count?: number; shares_count?: number; created_at: string; destaque?: boolean; status: string }
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: string }

async function getCategories(): Promise<Category[]> {
  try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/categories`, { next: { revalidate: 60 } }); if(!res.ok) return []; return await res.json() } catch { return [] }
}
async function getBanners(): Promise<Banner[]> {
  try { const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } }); if(!res.ok) return []; return await res.json() } catch { return [] }
}
function isVideoPost(post: Post){ const url = (post.media_url || '').toLowerCase(); return post.tipo === 'video' || url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video/upload') }
function isAudioPost(post: Post){ const url = (post.media_url || '').toLowerCase(); return post.tipo === 'audio' || post.tipo === 'musica' || url.includes('.mp3') }
function formatTitle(str: string){ if(!str) return ""; const lower = str.toLowerCase(); return lower.charAt(0).toUpperCase() + lower.slice(1) }

function PostCard({ post, cat }: { post: Post, cat?: Category }) {
  const views = (post as any).views?? 0
  return (
    <Link href={`/post/${post.slug || post.id}`} className="group bg-white border border-zinc-200 overflow-hidden hover:border-[#0a2a5e]/30 hover:shadow-sm transition-all block">
      <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative"><img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500" />{cat && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 bg-[#0a2a5e] text-white">{cat.nome}</span>}</div>
      <div className="p-4"><h3 className="font-semibold leading-tight line-clamp-2 text-[14px] text-zinc-900 group-hover:text-[#0a2a5e]">{formatTitle(post.titulo)}</h3>{post.descricao && <p className="text-[12px] text-zinc-500 line-clamp-2 mt-1.5">{formatTitle(post.descricao)}</p>}<div className="flex items-center justify-between mt-3"><span className="text-[11px] text-zinc-500">👁 {views}</span><span className="text-[10px] text-zinc-400">{new Date(post.created_at).toLocaleDateString('pt-AO')}</span></div></div>
    </Link>
  )
}
function BannerSlot({ banner, pos }: { banner?: Banner, pos: string }) {
  if(!banner) return null
  return (<div className="my-8"><p className="text-[9px] tracking-widest text-zinc-400 mb-2">Publicidade • {pos}</p><a href={banner.link_url} target="_blank" className="block border border-zinc-200"><img src={banner.imagem_url} alt={banner.titulo} className="w-full h-auto max-h-[180px] object-cover" /></a></div>)
}

export default async function Home() {
    const [postsRaw, apps, categories, banners] = await Promise.all([ getPosts(), getApps(), getCategories(), getBanners() ])
    const posts: Post[] = (Array.isArray(postsRaw)? postsRaw : []).filter((p: any) => p.status === 'published')
    const principal = posts.find(p => (p as any).destaque) || posts[0]
    const secundarios = posts.slice(1, 4)
    const maisLidos = [...posts].sort((a,b) => ((b as any).views||0) - ((a as any).views||0)).slice(0, 5)
    const videos = posts.filter(p => isVideoPost(p) || isAudioPost(p)).slice(0, 12)
    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    return (
        <main className="min-h-screen bg-[#f8fafc] text-zinc-900">
            <Header />
            <div className="px-4 sm:px-6 lg:px-8">
                <section className="max-w-7xl mx-auto mt-4 md:mt-6 mb-8 bg-[#0a2a5e] text-white border border-[#0a2a5e]">
                    <div className="grid grid-cols-12 gap-0">
                        <div className="col-span-12 md:col-span-7 p-6 md:p-10">
                            <div className="inline-flex bg-white text-[#0a2a5e] text-[9px] font-bold tracking-widest px-2 py-1 mb-4">Instituto • Connect hub</div>
                            <h1 className="text-[28px] md:text-[44px] font-bold leading-[0.95] tracking-tight">Informação<br/>que conecta<br/>Angola.</h1>
                            <p className="mt-4 text-white/70 text-[13px] max-w-md">Notícias, vídeos e tecnologia num só lugar, com o padrão visual do Inacom.</p>
                            <div className="mt-6 flex gap-2"><Link href="#destaques" className="px-5 py-2.5 bg-white text-[#0a2a5e] text-[11px] font-bold tracking-wide">Explorar notícias</Link><Link href="/sobre" className="px-5 py-2.5 border border-white/30 text-[11px] font-bold tracking-wide">Sobre nós</Link></div>
                            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4 max-w-sm"><div><p className="text-[20px] font-bold leading-none">{posts.length}</p><p className="text-[10px] text-white/50">Notícias</p></div><div><p className="text-[20px] font-bold leading-none">{categories.length}</p><p className="text-[10px] text-white/50">Categorias</p></div><div><p className="text-[20px] font-bold leading-none">{videos.length}</p><p className="text-[10px] text-white/50">Vídeos</p></div></div>
                        </div>
                        <div className="col-span-12 md:col-span-5 bg-white p-2 md:p-3">
                            {principal && (<Link href={`/post/${principal.slug || principal.id}`} className="block border border-zinc-200 h-full"><div className="aspect-video bg-zinc-100"><img src={principal.thumbnail_url || principal.media_url} className="w-full h-full object-cover" alt="" /></div><div className="p-4"><p className="text-[10px] font-bold tracking-widest text-[#0a2a5e]">Destaque principal</p><h3 className="font-bold leading-tight mt-1 line-clamp-2 text-zinc-900">{formatTitle(principal.titulo)}</h3></div></Link>)}
                        </div>
                    </div>
                </section>
                <BannerSlot banner={bannerTopo} pos="home_topo" />
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 md:gap-6 pb-16">
                    <div className="col-span-12 lg:col-span-8">
                        <section id="destaques" className="mb-8"><div className="flex items-center justify-between mb-3 border-b border-zinc-200 pb-2"><h2 className="text-[12px] font-bold tracking-widest text-zinc-900">Destaques • Hoje</h2><Link href="/posts" className="text-[11px] text-zinc-500">Ver todos →</Link></div><div className="grid grid-cols-12 gap-[2px] bg-zinc-200 border border-zinc-200"><div className="col-span-12 md:col-span-7 bg-white"><PostCard post={principal} cat={categories.find(c=>c.id===principal.category_id)} /></div><div className="col-span-12 md:col-span-5 grid gap-[2px] bg-zinc-200">{secundarios.map(p => <PostCard key={p.id} post={p} cat={categories.find(c=>c.id===p.category_id)} />)}</div></div></section>
                        {videos.length > 0 && <ConnectTVSection videos={videos} />}
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white border border-zinc-200 p-5"><h3 className="text-[11px] font-bold tracking-widest mb-4 border-b border-zinc-200 pb-2">Mais lidos • 24h</h3><div className="space-y-3">{maisLidos.map((p,i) => (<Link key={p.id} href={`/post/${p.slug || p.id}`} className="flex gap-3 group"><span className="text-[20px] font-bold text-zinc-200 group-hover:text-[#0a2a5e] leading-none">{String(i+1).padStart(2,'0')}</span><div><p className="text-[13px] font-medium leading-tight line-clamp-2 group-hover:text-[#0a2a5e]">{formatTitle(p.titulo)}</p><p className="text-[11px] text-zinc-500 mt-1">{(p as any).views||0} views</p></div></Link>))}</div></div>
                    </div>
                </div>
            </div>
        </main>
    )
}
