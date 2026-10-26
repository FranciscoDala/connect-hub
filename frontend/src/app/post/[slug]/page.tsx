// app/post/[slug]/page.tsx
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function formatKz(v?: number | null) {
    if (v == null) return null
    return Number(v).toLocaleString('pt-AO') + ' Kz'
}

async function getPost(slug: string) {
    try {
        let res = await fetch(`${API}/api/v1/posts/slug/${slug}`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    try {
        let res = await fetch(`${API}/api/v1/posts/${slug}`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    try {
        let res = await fetch(`${API}/api/v1/posts?limit=100`, { next: { revalidate: 30 } })
        if (res.ok) {
            const all = await res.json()
            return all.find((p: any) => p.slug === slug || p.id === slug)
        }
    } catch { }
    return null
}

async function getRelated(category_id: string, currentId: string) {
    try {
        const res = await fetch(`${API}/api/v1/posts?category_id=${category_id}&limit=6`, { next: { revalidate: 60 } })
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) return notFound()

    const categories = await getCategories()
    const banners = await getBanners()
    const related = post.category_id ? await getRelated(post.category_id, post.id) : []
    const cat = categories.find((c: any) => c.id === post.category_id)

    const isProduto = (post.tipo || '').toLowerCase() === 'produto' || (post.tipo || '').toLowerCase() === 'product'
    const views = post.views ?? 0
    const comments = post.comments_count ?? 0
    const shares = post.shares_count ?? 0
    const bannerDentro = banners.find((b: any) => b.posicao === 'dentro_post')
    const bannerSidebar = banners.find((b: any) => b.posicao === 'sidebar')

    return (
        <main className="min-h-screen bg-white text-slate-800">
            <Header />

            {/* Breadcrumb estilo home */}
            <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-24 pb-6">
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide">
                    <Link href="/" className="text-slate-400 hover:text-slate-700">Início</Link>
                    <span className="text-slate-300">/</span>
                    {cat && (
                        <>
                            <Link href={`/#${cat.slug}`} className="font-bold uppercase tracking-widest text-sky-700">{cat.nome}</Link>
                            <span className="text-slate-300">/</span>
                        </>
                    )}
                    <span className="text-slate-500 truncate max-w-50">{isProduto ? 'Produto' : post.tipo}</span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-20 sm:pb-28">
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    {/* CONTEÚDO */}
                    <article className="col-span-12 lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="p-6 sm:p-8 bg-white">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="h-px w-8 bg-sky-600" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-sky-800">{cat?.nome || (isProduto ? 'PRODUTO' : 'NOTÍCIA')}</span>
                                    <span className={`ml-2 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest ${post.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600'}`}>{post.status?.toUpperCase()}</span>
                                    <span className="text-[11px] text-slate-400 ml-auto">{new Date(post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <h1 className="mt-5 text-[28px] sm:text-[40px] font-semibold tracking-tight text-slate-700 leading-[0.95]">{post.titulo}</h1>
                                {post.descricao && <p className="mt-4 max-w-3xl text-[14px] sm:text-[16px] leading-6 text-slate-500">{post.descricao}</p>}

                                {isProduto && post.preco && (
                                    <div className="mt-6 flex items-baseline gap-3">
                                        <span className="text-[28px] font-bold tracking-tight text-slate-800">{formatKz(post.preco_promocional || post.preco)}</span>
                                        {post.em_promocao && post.preco_promocional && <span className="text-sm line-through text-slate-400">{formatKz(post.preco)}</span>}
                                        {post.em_promocao && <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white">PROMO</span>}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-600">👁 {views} visualizações</span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-600">💬 {comments}</span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-600">↗ {shares}</span>
                                    {isProduto && post.estoque != null && <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-2 text-[12px] font-bold text-green-700">Estoque: {post.estoque}</span>}
                                </div>
                            </div>

                            {(post.thumbnail_url || post.media_url) && (
                                <div className="border-y border-slate-200 bg-slate-100">
                                    <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="mx-auto h-auto max-h-155 w-full object-cover sm:object-contain bg-white" />
                                </div>
                            )}

                            <div className="p-6 sm:p-8 bg-white">
                                <div className="prose prose-slate max-w-none prose-p:text-[14px] prose-p:leading-6 prose-p:text-slate-600 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-700 prose-a:text-sky-700">
                                    {post.conteudo ? <div dangerouslySetInnerHTML={{ __html: post.conteudo }} /> : <p>{post.descricao || 'Conteúdo em breve.'}</p>}
                                </div>

                                {post.tags?.length > 0 && (
                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {post.tags.map((tag: string) => (
                                            <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {bannerDentro && (
                                    <div className="mt-10">
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Publicidade</p>
                                        <a href={bannerDentro.link_url} target="_blank" className="block overflow-hidden rounded-2xl border border-slate-200">
                                            <img src={bannerDentro.imagem_url} alt={bannerDentro.titulo} className="w-full" />
                                        </a>
                                    </div>
                                )}

                                <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                    <p className="text-[13px] font-semibold text-slate-700">{isProduto ? 'Interessado neste produto?' : 'Gostou? Partilha com teus amigos'}</p>
                                    <div className="mt-3 grid grid-cols-1 gap-2 sm:flex">
                                        {isProduto ? (
                                            <a href={`https://wa.me/244000000000?text=${encodeURIComponent(`Olá, quero ${post.titulo} - https://connect-uuo9.onrender.com/post/${post.slug}`)}`} target="_blank" className="rounded-full bg-slate-900 px-5 py-3 text-center text-[12px] font-bold text-white">Encomendar no WhatsApp</a>
                                        ) : (
                                            <>
                                                <a href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} - https://connect-uuo9.onrender.com/post/${post.slug || post.id}`)}`} target="_blank" className="rounded-full bg-[#25D366] px-5 py-3 text-center text-[12px] font-bold text-white">WhatsApp</a>
                                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://connect-uuo9.onrender.com/post/${post.slug || post.id}`)}`} target="_blank" className="rounded-full bg-[#1877F2] px-5 py-3 text-center text-[12px] font-bold text-white">Facebook</a>
                                            </>
                                        )}
                                        <Link href="/" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-[12px] font-bold text-slate-700">Voltar ao início</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {related.length > 0 && (
                            <div className="mt-12">
                                <div className="flex items-center gap-3">
                                    <span className="h-px w-8 bg-sky-600" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-sky-800">Relacionados • {cat?.nome?.toUpperCase()}</h3>
                                </div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {related.map((r: any) => (
                                        <Link key={r.id} href={`/post/${r.slug || r.id}`} className="group flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:shadow-md">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white border">
                                                {r.thumbnail_url || r.media_url ? <img src={r.thumbnail_url || r.media_url} className="h-full w-full object-cover transition group-hover:scale-105" alt="" /> : <div className="grid h-full place-items-center text-[10px] font-bold text-slate-400">IMG</div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-slate-700">{r.titulo}</p>
                                                <p className="mt-1 text-[11px] text-slate-500">👁 {r.views || 0} • {r.tipo}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* SIDEBAR - estilo home */}
                    <aside className="col-span-12 lg:col-span-4 space-y-6">
                        {bannerSidebar && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Publicidade</p>
                                <a href={bannerSidebar.link_url} target="_blank"><img src={bannerSidebar.imagem_url} alt="" className="w-full rounded-xl" /></a>
                            </div>
                        )}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex items-center gap-2">
                                <span className="h-px w-6 bg-sky-600" />
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-sky-800">Sobre</h4>
                            </div>
                            <div className="mt-4 space-y-3 text-[12px]">
                                <p className="flex justify-between"><span className="text-slate-400">Categoria</span><span className="font-semibold text-slate-700">{cat?.nome || 'Geral'}</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Tipo</span><span className="font-semibold text-slate-700 capitalize">{post.tipo}</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Data</span><span className="font-semibold text-slate-700">{new Date(post.created_at).toLocaleDateString('pt-AO')}</span></p>
                                {post.sku && <p className="flex justify-between"><span className="text-slate-400">SKU</span><span className="font-mono text-[11px] font-semibold">{post.sku}</span></p>}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    )
}
