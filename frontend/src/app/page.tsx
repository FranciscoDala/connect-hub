import { getPosts, getApps } from '@/lib/api'
import Header from '@/components/Header'
import Link from 'next/link'

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

function PostCard({ post, cat }: { post: Post, cat?: Category }) {
  const views = (post as any).views?? (post as any).views_count?? 0
  const comments = (post as any).comments_count?? 0
  const shares = (post as any).shares_count?? 0
  return (
    <Link href={`/post/${post.slug || post.id}`} className="group block bg-white border border-zinc-200 rounded-[20px] overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all">
      <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
        {post.thumbnail_url || post.media_url? (
          <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center bg-zinc-900 text-white font-bold text-xs tracking-widest">{post.tipo?.toUpperCase()}</div>
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
  const Wrapper = banner.link_url? 'a' : 'div'
  return (
    <div className="my-8">
      <p className="text-[10px] tracking-widest text-zinc-400 mb-2 px-1">PUBLICIDADE • {pos.toUpperCase()}</p>
      {/* @ts-ignore */}
      <Wrapper href={banner.link_url} target={banner.link_url? "_blank" : undefined} className="block w-full rounded-[16px] overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-95 transition">
        <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-auto object-cover max-h-[160px] md:max-h-[220px]" />
      </Wrapper>
    </div>
  )
}

export default async function Home() {
    const [postsRaw, apps, categories, banners] = await Promise.all([
      getPosts(),
      getApps(),
      getCategories(),
      getBanners()
    ])

    const posts: Post[] = (Array.isArray(postsRaw)? postsRaw : []).filter((p: any) => p.status === 'published')
    const destaques = posts.filter(p => (p as any).destaque).slice(0, 4)
    const principal = destaques[0] || posts[0]
    const secundarios = destaques.slice(1, 4).length? destaques.slice(1, 4) : posts.slice(1, 4)
    const maisLidos = [...posts].sort((a,b) => ((b as any).views||0) - ((a as any).views||0)).slice(0, 5)
    const videos = posts.filter(p => p.tipo === 'video').slice(0, 4)
    const recentes = posts.slice(0, 8)

    const bannerTopo = banners.find(b => b.posicao === 'home_topo')
    const bannerMeio = banners.find(b => b.posicao === 'home_meio')
    const bannerSidebar = banners.find(b => b.posicao === 'sidebar')

    const postsByCategory = categories.map(cat => ({
      cat,
      posts: posts.filter(p => p.category_id === cat.id).slice(0, 4)
    })).filter(g => g.posts.length > 0)

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-zinc-900">
            <Header />

            <div className="px-4 sm:px-6 lg:px-8">
                {/* HERO - MANTIDO MAS MAIS PRO */}
                <section className="relative max-w-7xl mx-auto mt-6 md:mt-8 mb-10 rounded-[24px] md:rounded-[32px] overflow-hidden border border-zinc-200 bg-white">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.3]" />
                    <div className="absolute -top-32 -left-32 size-[400px] bg-violet-300 rounded-full blur-[120px] opacity-20" />
                    <div className="absolute -bottom-32 -right-32 size-[400px] bg-blue-300 rounded-full blur-[120px] opacity-20" />
                    <div className="relative grid grid-cols-12 gap-8 p-6 sm:p-10 md:p-14 items-center">
                        <div className="col-span-12 md:col-span-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-[10px] tracking-widest font-bold mb-6 shadow-sm">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                CONNECT.HUB • AO VIVO
                            </div>
                            <h1 className="text-[32px] sm:text-[44px] md:text-[56px] font-black tracking-tight leading-[0.9]">
                                Informação<br />
                                que <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">conecta</span><br />
                                Angola.
                            </h1>
                            <p className="mt-5 text-zinc-600 max-w-xl text-[13px] md:text-[14px] leading-relaxed">
                                Notícias, vídeos, análises e tecnologia num só lugar. Atualizado em tempo real pela nossa redação.
                            </p>
                            <div className="mt-7 flex gap-2">
                                <Link href="#destaques" className="px-6 py-3 rounded-full bg-zinc-900 text-white text-[11px] font-bold tracking-widest hover:bg-black transition">EXPLORAR NOTÍCIAS</Link>
                                <Link href="/sobre" className="px-6 py-3 rounded-full bg-white border border-zinc-200 text-[11px] font-bold tracking-widest hover:bg-zinc-50 transition">SOBRE NÓS</Link>
                            </div>
                            <div className="mt-6 flex gap-4 text-[11px] text-zinc-500">
                              <span>• {posts.length} notícias publicadas</span>
                              <span>• {categories.length} categorias</span>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-5 relative">
                            {principal? (
                              <Link href={`/post/${principal.slug || principal.id}`} className="block bg-white rounded-[20px] border border-zinc-200 p-3 shadow-xl hover:shadow-2xl transition">
                                <div className="aspect-video rounded-[12px] overflow-hidden bg-zinc-100 mb-3">
                                  {principal.thumbnail_url || principal.media_url? <img src={principal.thumbnail_url || principal.media_url} className="w-full h-full object-cover" alt="" /> : <div className="grid place-items-center h-full font-bold">CONNECT</div>}
                                </div>
                                <p className="text-[10px] font-bold tracking-widest text-violet-600">DESTAQUE PRINCIPAL</p>
                                <h3 className="font-bold leading-tight mt-1 line-clamp-2">{principal.titulo}</h3>
                                <p className="text-[12px] text-zinc-500 mt-1 line-clamp-2">{principal.descricao}</p>
                              </Link>
                            ) : (
                              <div className="bg-white rounded-[20px] border p-4 shadow-xl">
                                <div className="h-3 w-3/4 bg-zinc-100 rounded mb-3" />
                                <div className="h-3 w-full bg-violet-100 rounded mb-2" />
                                <div className="p-3 rounded-xl bg-zinc-900 text-green-400 text-xs font-mono">✓ connect-hub online<br/>→ {posts.length} posts</div>
                              </div>
                            )}
                        </div>
                    </div>
                </section>

                <BannerSlot banner={bannerTopo} pos="home_topo" />

                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-8 pb-16">
                    {/* COLUNA PRINCIPAL */}
                    <div className="col-span-12 lg:col-span-8">
                        {/* DESTAQUES */}
                        <section id="destaques" className="mb-10">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[13px] font-bold tracking-[0.2em]">DESTAQUES • HOJE</h2>
                            <Link href="/posts" className="text-[11px] font-semibold text-zinc-500 hover:text-black">Ver todos →</Link>
                          </div>
                          {principal && secundarios.length > 0? (
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-12 md:col-span-7">
                                <PostCard post={principal} cat={categories.find(c=>c.id===principal.category_id)} />
                              </div>
                              <div className="col-span-12 md:col-span-5 grid gap-4">
                                {secundarios.map(p => <PostCard key={p.id} post={p} cat={categories.find(c=>c.id===p.category_id)} />)}
                              </div>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-3 gap-4">
                              {recentes.slice(0,3).map(p => <PostCard key={p.id} post={p} />)}
                            </div>
                          )}
                        </section>

                        <BannerSlot banner={bannerMeio} pos="home_meio" />

                        {/* POR CATEGORIA */}
                        {postsByCategory.map(({ cat, posts }) => (
                          <section key={cat.id} className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-2 h-2 rounded-full" style={{ background: cat.cor || '#7c3aed' }} />
                              <h2 className="text-[13px] font-bold tracking-[0.2em] uppercase">{cat.nome}</h2>
                              <div className="h-px flex-1 bg-zinc-200 ml-2" />
                              <Link href={`/categoria/${cat.slug}`} className="text-[11px] font-semibold text-zinc-500 hover:text-black shrink-0">Ver tudo</Link>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              {posts.map(p => <PostCard key={p.id} post={p} cat={cat} />)}
                            </div>
                          </section>
                        ))}

                        {/* VÍDEOS */}
                        {videos.length > 0 && (
                          <section className="mb-10 bg-zinc-900 rounded-[24px] p-5 md:p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-[13px] font-bold tracking-[0.2em]">VÍDEOS • CONNECT TV</h2>
                              <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">AO VIVO</span>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              {videos.map(p => (
                                <Link key={p.id} href={`/post/${p.slug || p.id}`} className="group relative rounded-[16px] overflow-hidden bg-zinc-800 border border-white/10 aspect-video grid place-items-center">
                                  {p.thumbnail_url? <img src={p.thumbnail_url} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" alt="" /> : null}
                                  <div className="relative z-10 w-12 h-12 rounded-full bg-white text-black grid place-items-center font-bold">▶</div>
                                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[12px] font-semibold line-clamp-1">{p.titulo}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </section>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* MAIS LIDOS */}
                        <div className="bg-white border border-zinc-200 rounded-[20px] p-5">
                          <h3 className="text-[11px] font-bold tracking-widest mb-4">MAIS LIDOS • 24H</h3>
                          <div className="space-y-3">
                            {maisLidos.map((p,i) => (
                              <Link key={p.id} href={`/post/${p.slug || p.id}`} className="flex gap-3 group">
                                <span className="text-[22px] font-black text-zinc-200 group-hover:text-zinc-900 leading-none">{String(i+1).padStart(2,'0')}</span>
                                <div className="min-w-0">
                                  <p className="text-[13px] font-medium leading-tight line-clamp-2 group-hover:text-violet-600 transition">{p.titulo}</p>
                                  <p className="text-[11px] text-zinc-500 mt-1">👁 {(p as any).views||0} • {categories.find(c=>c.id===p.category_id)?.nome || p.tipo}</p>
                                </div>
                              </Link>
                            ))}
                            {maisLidos.length===0 && <p className="text-xs text-zinc-400">Sem dados ainda</p>}
                          </div>
                        </div>

                        {/* BANNER SIDEBAR */}
                        {bannerSidebar && <BannerSlot banner={bannerSidebar} pos="sidebar" />}

                        {/* APPS */}
                        <div className="bg-white border border-zinc-200 rounded-[20px] p-5">
                          <h3 className="text-[11px] font-bold tracking-widest mb-4">NOSSOS APPS</h3>
                          <div className="grid gap-2.5">
                            {apps.slice(0,6).map((a: any) => (
                              <div key={a.id} className="p-3.5 rounded-xl bg-zinc-900 text-white hover:bg-black cursor-pointer transition flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-[13px]">{a.nome}</h4>
                                  <p className="text-[11px] opacity-70">{a.status || 'ativo'}</p>
                                </div>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/10">→</span>
                              </div>
                            ))}
                            {apps.length===0 && <p className="text-xs text-zinc-400">Nenhum app cadastrado</p>}
                          </div>
                        </div>

                        {/* CATEGORIAS */}
                        <div className="bg-white border border-zinc-200 rounded-[20px] p-5">
                          <h3 className="text-[11px] font-bold tracking-widest mb-3">EXPLORAR CATEGORIAS</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {categories.map(c => (
                              <Link key={c.id} href={`/categoria/${c.slug}`} className="px-3 py-1.5 rounded-full border bg-zinc-50 hover:bg-black hover:text-white text-[11px] font-medium transition flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: c.cor || '#000' }} /> {c.nome}
                              </Link>
                            ))}
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
