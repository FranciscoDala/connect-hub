// app/post/[slug]/page.tsx
import Link from 'next/link'
import Header from '@/components/Header'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getPost(slug: string) {
    // tenta por slug primeiro, depois por id, depois varrendo a lista (fallback)
    try {
        let res = await fetch(`${API}/api/v1/posts/slug/${slug}`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    try {
        let res = await fetch(`${API}/api/v1/posts/${slug}`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    // fallback: busca lista e encontra por slug
    try {
        let res = await fetch(`${API}/api/v1/posts`, { next: { revalidate: 30 } })
        if (res.ok) {
            const all = await res.json()
            return all.find((p: any) => p.slug === slug || p.id === slug)
        }
    } catch { }
    return null
}

async function getRelated(category_id: string, currentId: string) {
    try {
        const res = await fetch(`${API}/api/v1/posts?category_id=${category_id}&limit=4`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const data = await res.json()
        return data.filter((p: any) => p.id !== currentId).slice(0, 4)
    } catch { return [] }
}

async function getCategories() {
    try {
        const res = await fetch(`${API}/api/v1/categories`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        return await res.json()
    } catch { return [] }
}

async function getBanners() {
    try {
        const res = await fetch(`${API}/api/v1/banners?ativo=true`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        return await res.json()
    } catch { return [] }
}

// Componente client para views e share
function PostActions({ post }: { post: any }) {
    return (
        <div className="post-actions-client">
            <script dangerouslySetInnerHTML={{
                __html: `
        (function(){
          try {
            fetch('${API}/api/v1/posts/${post.id}/view', { method: 'POST' }).catch(()=>{})
            fetch('${API}/api/v1/posts/${post.id}/views', { method: 'POST' }).catch(()=>{})
          } catch {}
        })()
      `}} />
        </div>
    )
}

export default async function PostPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug)
    if (!post) return notFound()

    const categories = await getCategories()
    const banners = await getBanners()
    const related = post.category_id ? await getRelated(post.category_id, post.id) : []
    const cat = categories.find((c: any) => c.id === post.category_id)

    const views = post.views ?? post.views_count ?? 0
    const comments = post.comments_count ?? 0
    const shares = post.shares_count ?? post.shares ?? 0
    const bannerDentro = banners.find((b: any) => b.posicao === 'dentro_post')
    const bannerSidebar = banners.find((b: any) => b.posicao === 'sidebar')

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-zinc-900">
            <Header />
            <PostActions post={post} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    {/* CONTEÚDO */}
                    <article className="col-span-12 lg:col-span-8">
                        <div className="mb-4 flex items-center gap-2 text-[11px]">
                            <Link href="/" className="text-zinc-500 hover:text-black">Início</Link>
                            <span className="text-zinc-300">/</span>
                            {cat && <Link href={`/categoria/${cat.slug}`} className="font-bold" style={{ color: cat.cor || '#7c3aed' }}>{cat.nome}</Link>}
                            <span className="text-zinc-300">/</span>
                            <span className="text-zinc-400 truncate max-w-[180px]">{post.tipo}</span>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-[24px] overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    {cat && <span className="text-[10px] px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 font-bold tracking-widest">{cat.nome.toUpperCase()}</span>}
                                    <span className={`text-[10px] px-3 py-1 rounded-full border font-bold tracking-widest ${post.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100'}`}>{post.status?.toUpperCase()}</span>
                                    <span className="text-[11px] text-zinc-500">{new Date(post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <h1 className="text-[26px] md:text-[38px] font-black leading-[0.95] tracking-tight">{post.titulo}</h1>
                                {post.descricao && <p className="mt-4 text-[15px] md:text-[17px] leading-relaxed text-zinc-600">{post.descricao}</p>}

                                <div className="mt-6 grid grid-cols-3 gap-2 md:flex md:gap-2">
                                    <span className="flex items-center justify-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2.5 rounded-full text-[12px] font-medium w-full md:w-auto">👁 {views} visualizações</span>
                                    <span className="flex items-center justify-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2.5 rounded-full text-[12px] font-medium w-full md:w-auto">💬 {comments} comentários</span>
                                    <span className="flex items-center justify-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-2.5 rounded-full text-[12px] font-medium w-full md:w-auto">↗ {shares} partilhas</span>
                                </div>
                            </div>

                            {(post.thumbnail_url || post.media_url) && (
                                <div className="w-full bg-zinc-100 border-y border-zinc-200">
                                    <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-auto max-h-[560px] object-cover mx-auto" />
                                </div>
                            )}

                            <div className="p-6 md:p-8">
                                <div className="prose prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-[15px] prose-headings:font-bold prose-a:text-violet-600">
                                    {post.conteudo ? (
                                        <div dangerouslySetInnerHTML={{ __html: post.conteudo }} />
                                    ) : (
                                        <p className="text-zinc-600">{post.descricao || 'Conteúdo em breve.'}</p>
                                    )}
                                </div>

                                {post.tags && post.tags.length > 0 && (
                                    <div className="mt-8 flex flex-wrap gap-1.5">
                                        {post.tags.map((tag: string) => (
                                            <span key={tag} className="px-3 py-1 rounded-full bg-zinc-50 border text-[11px] font-medium">#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {bannerDentro && (
                                    <div className="mt-8">
                                        <p className="text-[10px] tracking-widest text-zinc-400 mb-2">PUBLICIDADE</p>
                                        <a href={bannerDentro.link_url} target="_blank" className="block rounded-[16px] overflow-hidden border">
                                            <img src={bannerDentro.imagem_url} alt={bannerDentro.titulo} className="w-full h-auto" />
                                        </a>
                                    </div>
                                )}

                                <div className="mt-10 p-4 rounded-[16px] bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <p className="text-[12px] font-medium">Gostou? Partilha com teus amigos</p>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <a href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} - ${API.replace('/api', '')}/post/${post.slug || post.id}`)}`} target="_blank" className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-green-500 text-white text-[12px] font-bold text-center">WhatsApp</a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://connect-uuo9.onrender.com/post/${post.slug || post.id}`)}`} target="_blank" className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-blue-600 text-white text-[12px] font-bold text-center">Facebook</a>
                                        <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-zinc-900 text-white text-[12px] font-bold">Copiar Link</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {related.length > 0 && (
                            <div className="mt-10">
                                <h3 className="text-[12px] font-bold tracking-[0.2em] mb-4">RELACIONADOS • {cat?.nome?.toUpperCase()}</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {related.map((r: any) => (
                                        <Link key={r.id} href={`/post/${r.slug || r.id}`} className="bg-white border rounded-[16px] p-3 flex gap-3 hover:shadow-md transition">
                                            <div className="w-20 h-20 rounded-[10px] bg-zinc-100 overflow-hidden shrink-0">
                                                {r.thumbnail_url || r.media_url ? <img src={r.thumbnail_url || r.media_url} className="w-full h-full object-cover" alt="" /> : <div className="grid place-items-center h-full text-[10px] font-bold">IMG</div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold line-clamp-2 leading-tight">{r.titulo}</p>
                                                <p className="text-[11px] text-zinc-500 mt-1">👁 {r.views || 0} • 💬 {r.comments_count || 0}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* SIDEBAR */}
                    <aside className="col-span-12 lg:col-span-4 space-y-6">
                        {bannerSidebar && (
                            <div className="bg-white border rounded-[20px] overflow-hidden p-3">
                                <p className="text-[10px] tracking-widest text-zinc-400 mb-2">PUBLICIDADE</p>
                                <a href={bannerSidebar.link_url} target="_blank"><img src={bannerSidebar.imagem_url} alt="" className="w-full rounded-[12px]" /></a>
                            </div>
                        )}
                        <div className="bg-white border rounded-[20px] p-5">
                            <h4 className="text-[11px] font-bold tracking-widest mb-3">SOBRE ESTA NOTÍCIA</h4>
                            <div className="space-y-2 text-[12px]">
                                <p><span className="text-zinc-500">Categoria:</span> <span className="font-semibold">{cat?.nome || 'Geral'}</span></p>
                                <p><span className="text-zinc-500">Tipo:</span> <span className="font-semibold">{post.tipo}</span></p>
                                <p><span className="text-zinc-500">Publicado:</span> <span className="font-semibold">{new Date(post.created_at).toLocaleString('pt-AO')}</span></p>
                                <p><span className="text-zinc-500">ID:</span> <span className="font-mono text-[11px]">{post.id.slice(0, 8)}...</span></p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}
