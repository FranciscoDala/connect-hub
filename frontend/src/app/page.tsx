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
type Banner = { id: string; titulo: string; imagem_url: string; link_url?: string; posicao: string }

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/categories`, { next: { revalidate: 60 } })
    if(!res.ok) return []
    return await res.json()
  } catch { return [] }
}
async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } })
    if(!res.ok) return []
    return await res.json()
  } catch { return [] }
}

function isVideoPost(post: Post){
  const url = (post.media_url || '').toLowerCase()
  return post.tipo === 'video' || url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video/upload')
}
function isAudioPost(post: Post){
  const url = (post.media_url || '').toLowerCase()
  return post.tipo === 'audio' || post.tipo === 'musica' || url.includes('.mp3')
}

function PostCard({ post, cat }: { post: Post, cat?: Category }) {
  const views = (post as any).views?? 0
  const comments = (post as any).comments_count?? 0
  const shares = (post as any).shares_count?? 0
  return (
    <Link href={`/post/${post.slug || post.id}`} className="group bg-white border border-zinc-200 rounded-[20px] overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all block">
      <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
        {post.thumbnail_url || post.media_url? (
          <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center bg-zinc-900 text-white font-bold text-xs">{post.tipo?.toUpperCase()}</div>
        )}
        {cat && <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border shadow-sm" style={{ color: cat.cor || '#000' }}>{cat.nome}</span>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-violet-600 transition text-[14px]">{post.titulo}</h3>
        {post.descricao && <p className="text-[12px] text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">{post.descricao}</p>}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] bg-zinc-50 border px-2 py-1 rounded-full">👁 {views}</span>
            <span className="text-[11px] bg-zinc-50 border px-2 py-1 rounded-full">💬 {comments}</span>
            <span className="text-[11px] bg-zinc-50 border px-2 py-1 rounded-full hidden sm:flex">↗ {shares}</span>
          </div>
          <span className="text-[10px] text-zinc-400">{new Date(post.created_at).toLocaleDateString('pt-AO')}</span>
        </div>
      </div>
    </Link>
  )
}

function BannerSlot({ banner, pos }: { banner?: Banner, pos: string }) {
  if(!banner) return null
  return (
    <div className="my-8">
      <p className="text-[10px] tracking-widest text-zinc-400 mb-2 px-1">PUBLICIDADE • {pos.toUpperCase()}</p>
      <a href={banner.link_url} target={banner.link_url? "_blank" : undefined} className="block w-full rounded-[16px] overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-95 transition">
        <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-auto object-cover max-h-[160px] md:max-h-[220px]" />
      </a>
    </div>
  )
}

export default async function Home() {
    const [postsRaw, apps, categories, banners] = await Promise.all([ getPosts(), getApps(), getCategories(), getBanners() ])
    const posts: Post[] = (Array.isArray(postsRaw)? postsRaw : []).filter((p: any) => p.status === 'published')
    const destaques = posts.filter(p => (p as any).destaque).slice(0, 4)
    const principal = destaques[0] || posts[0]
    const secundarios = destaques.slice(1, 4).length? destaques.slice(1, 4) : posts.slice(1, 4)
    const maisLidos = [...posts].sort((a,b) => ((b as any).views||0) - ((a as any).views||0)).slice(0, 5)
    const videos = posts.filter(p => isVideoPost(p) || isAudioPost(p)).slice(0, 6)
    const recentes = posts.slice(0, 8)
    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    const bannerMeio = banners.find(b => b.posicao === 'home_meio')
    const bannerSidebar = banners.find(b => b.posicao === 'sidebar')
    const postsByCategory = categories.map(cat => ({ cat, posts: posts.filter(p => p.category_id === cat.id).slice(0, 4) })).filter(g => g.posts.length > 0)

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-zinc-900">
            <Header />
            <div className="px-4 sm:px-6 lg:px-8">

                {/* HERO AQUALIFE - GLASS PROFISSIONAL */}
                <section className="relative max-w-7xl mx-auto mt-6 md:mt-8 mb-14 rounded-[32px] overflow-hidden border border-white/10 bg-[#020617] min-h-[640px] md:min-h-[720px]">
                    <img src="https://images.unsplash.com/photo-1551244072-5d1289329ab9?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover" alt="ocean" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/70 to-[#020617]/10" />
                    <div className="absolute -bottom-20 -left-20 w-[380px] h-[260px] bg-[#9333ea] rounded-full blur-[70px] opacity-60" />
                    <div className="absolute -bottom-10 -right-10 w-[280px] h-[180px] bg-[#22d3ee] rounded-full blur-[60px] opacity-70" />

                    <div className="hidden md:block absolute right-[-20px] lg:right-[20px] top-[90px] w-[58%] max-w-[680px] z-10">
                        <img src="/turtle.png" alt="tartaruga" className="w-full h-auto drop-shadow-[0_0_50px_rgba(56,189,248,0.6)]" />
                    </div>

                    <div className="relative z-20 m-4 md:m-6 lg:m-8 max-w-[560px] rounded-[32px] border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-[28px] shadow-[0_0_0_1px_rgba(96,165,250,0.2),0_0_80px_rgba(59,130,246,0.15)_inset] p-6 md:p-8">
                        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-[11px] text-cyan-200 backdrop-blur">
                            <span>〰️</span> Mergulhe num mundo melhor
                        </div>
                        <h1 className="text-[36px] md:text-[54px] font-black tracking-tight leading-[0.9] text-white mt-5">
                            Descubra.<br/>Experimente.<br/><span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Inove.</span>
                        </h1>
                        {principal? (
                          <div className="mt-4">
                            <p className="text-white/70 text-[13px] leading-relaxed line-clamp-2">{principal.titulo}</p>
                            <div className="flex gap-3 mt-6">
                                <Link href={`/post/${principal.slug || principal.id}`} className="px-7 py-3 rounded-full bg-gradient-to-r from-[#9333ea] to-[#38bdf8] text-white text-[13px] font-bold flex items-center gap-2 shadow-lg">Começar <span>→</span></Link>
                                <Link href={`/post/${principal.slug || principal.id}`} className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white text-[13px] flex items-center gap-2 backdrop-blur"><span className="w-7 h-7 rounded-full bg-white/10 grid place-items-center">▶</span> Ver história</Link>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-white/60 text-[13px] mt-4 max-w-[360px]">Explore tecnologia de ponta e crie memórias que duram a vida toda.</p>
                            <div className="flex gap-3 mt-6">
                                <Link href="#destaques" className="px-7 py-3 rounded-full bg-gradient-to-r from-[#9333ea] to-[#38bdf8] text-white text-[13px] font-bold">Começar →</Link>
                                <Link href="#destaques" className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white text-[13px]">▶ Ver história</Link>
                            </div>
                          </>
                        )}
                        <div className="mt-8 rounded-[16px] bg-white/[0.06] border border-white/10 p-2.5 flex gap-2 backdrop-blur">
                            <div className="flex-1 flex gap-2 items-center text-[11px] text-white/80 border-r border-white/10 pr-2"><span className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">🍃</span><div><b className="text-white">IA Avançada</b><br/><span className="text-[10px] opacity-60">Sustentável</span></div></div>
                            <div className="flex-1 flex gap-2 items-center text-[11px] text-white/80 border-r border-white/10 pr-2"><span className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">💎</span><div><b className="text-white">Premium</b><br/><span className="text-[10px] opacity-60">Classe</span></div></div>
                            <div className="flex-1 flex gap-2 items-center text-[11px] text-white/80"><span className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">🛡️</span><div><b className="text-white">Seguro</b><br/><span className="text-[10px] opacity-60">Confiável</span></div></div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-auto md:w-[640px] z-30 rounded-[18px] border border-white/10 bg-white/[0.08] backdrop-blur-[20px] flex justify-around py-3.5 px-4">
                        <div className="flex gap-2.5 items-center text-white"><span className="w-8 h-8 rounded-full bg-purple-500/30 grid place-items-center text-[12px]">👥</span><div><b className="text-[14px]">12K+</b><br/><span className="text-[10px] opacity-60">Usuários felizes</span></div></div>
                        <div className="w-px bg-white/10" />
                        <div className="flex gap-2.5 items-center text-white"><span className="w-8 h-8 rounded-full bg-pink-500/30 grid place-items-center text-[12px]">🪸</span><div><b className="text-[14px]">350+</b><br/><span className="text-[10px] opacity-60">Destinos Tech</span></div></div>
                        <div className="w-px bg-white/10 hidden sm:block" />
                        <div className="hidden sm:flex gap-2.5 items-center text-white"><span className="w-8 h-8 rounded-full bg-cyan-500/30 grid place-items-center text-[12px]">📸</span><div><b className="text-[14px]">25K+</b><br/><span className="text-[10px] opacity-60">Momentos</span></div></div>
                    </div>
                </section>

                <BannerSlot banner={bannerTopo} pos="home_topo" />

                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-8 pb-16">
                    <div className="col-span-12 lg:col-span-8">
                        <section id="destaques" className="mb-10">
                          <div className="flex items-center justify-between mb-4"><h2 className="text-[13px] font-bold tracking-[0.2em]">DESTAQUES • HOJE</h2><Link href="/posts" className="text-[11px] font-semibold text-zinc-500 hover:text-black">Ver todos →</Link></div>
                          {principal && secundarios.length > 0? (
                            <div className="grid grid-cols-12 gap-4"><div className="col-span-12 md:col-span-7"><PostCard post={principal} cat={categories.find(c=>c.id===principal.category_id)} /></div><div className="col-span-12 md:col-span-5 grid gap-4">{secundarios.map(p => <PostCard key={p.id} post={p} cat={categories.find(c=>c.id===p.category_id)} />)}</div></div>
                          ) : (
                            <div className="grid md:grid-cols-3 gap-4">{recentes.slice(0,3).map(p => <PostCard key={p.id} post={p} />)}</div>
                          )}
                        </section>

                        <BannerSlot banner={bannerMeio} pos="home_meio" />

                        {postsByCategory.map(({ cat, posts }) => (
                          <section key={cat.id} className="mb-10">
                            <div className="flex items-center gap-3 mb-4"><span className="w-2 h-2 rounded-full" style={{ background: cat.cor || '#7c3aed' }} /><h2 className="text-[13px] font-bold tracking-[0.2em] uppercase">{cat.nome}</h2><div className="h-px flex-1 bg-zinc-200 ml-2" /><Link href={`/categoria/${cat.slug}`} className="text-[11px] font-semibold text-zinc-500 hover:text-black shrink-0">Ver tudo</Link></div>
                            <div className="grid sm:grid-cols-2 gap-4">{posts.map(p => <PostCard key={p.id} post={p} cat={cat} />)}</div>
                          </section>
                        ))}

                        {videos.length > 0 && <ConnectTVSection videos={videos} />}
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-[20px] p-5">
                          <h3 className="text-[11px] font-bold tracking-widest mb-4">MAIS LIDOS • 24H</h3>
                          <div className="space-y-3">
                            {maisLidos.map((p,i) => (
                              <Link key={p.id} href={`/post/${p.slug || p.id}`} className="flex gap-3 group"><span className="text-[22px] font-black text-zinc-200 group-hover:text-zinc-900 leading-none">{String(i+1).padStart(2,'0')}</span><div className="min-w-0"><p className="text-[13px] font-medium leading-tight line-clamp-2 group-hover:text-violet-600 transition">{p.titulo}</p><p className="text-[11px] text-zinc-500 mt-1">👁 {(p as any).views||0} • {categories.find(c=>c.id===p.category_id)?.nome || p.tipo}</p></div></Link>
                            ))}
                          </div>
                        </div>
                        {bannerSidebar && <BannerSlot banner={bannerSidebar} pos="sidebar" />}
                        <div className="bg-white border border-zinc-200 rounded-[20px] p-5">
                          <h3 className="text-[11px] font-bold tracking-widest mb-4">NOSSOS APPS</h3>
                          <div className="grid gap-2.5">
                            {apps.slice(0,6).map((a: any) => (
                              <div key={a.id} className="p-3.5 rounded-xl bg-zinc-900 text-white flex justify-between items-center"><div><h4 className="font-bold text-[13px]">{a.nome}</h4><p className="text-[11px] opacity-70">{a.status || 'ativo'}</p></div><span className="text-[10px] px-2 py-1 rounded-full bg-white/10">→</span></div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white border border-zinc-200 rounded-[20px] p-5">
                          <h3 className="text-[11px] font-bold tracking-widest mb-3">EXPLORAR CATEGORIAS</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {categories.map(c => (
                              <Link key={c.id} href={`/categoria/${c.slug}`} className="px-3 py-1.5 rounded-full border bg-zinc-50 hover:bg-black hover:text-white text-[11px] font-medium transition flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c.cor || '#000' }} /> {c.nome}</Link>
                            ))}
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
