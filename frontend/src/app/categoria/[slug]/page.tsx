// app/categoria/[slug]/page.tsx
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getCategory(slug: string) {
    const cleanSlug = decodeURIComponent(slug).trim()
    try {
        const res = await fetch(`${API}/api/v1/categories/slug/${encodeURIComponent(cleanSlug)}`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    try {
        const res = await fetch(`${API}/api/v1/categories/${encodeURIComponent(cleanSlug)}`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    try {
        const res = await fetch(`${API}/api/v1/categories`, { next: { revalidate: 30 } })
        if (res.ok) {
            const cats: any[] = await res.json()
            const found = cats.find(c => (c.slug || '').toLowerCase() === cleanSlug.toLowerCase())
            if (found) return found
        }
    } catch { }
    return null
}

async function getPostsByCategory(slug: string) {
    const cleanSlug = decodeURIComponent(slug).trim()
    try {
        const res = await fetch(`${API}/api/v1/categories/slug/${encodeURIComponent(cleanSlug)}/posts?limit=50`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    try {
        const res = await fetch(`${API}/api/v1/posts?category_slug=${encodeURIComponent(cleanSlug)}&limit=50`, { next: { revalidate: 30 } })
        if (res.ok) return await res.json()
    } catch { }
    return []
}

function getTipoLabel(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('prod')) return 'PRODUTO'
    if (t.includes('noticia')) return 'NOTÍCIA'
    if (t.includes('serv')) return 'SERVIÇO'
    if (t.includes('evento') || t.includes('festa')) return 'EVENTO'
    return (tipo || 'POST').toUpperCase()
}

function getTipoStyle(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('prod')) return 'bg-emerald-600 text-white'
    if (t.includes('noticia')) return 'bg-sky-600 text-white'
    if (t.includes('serv')) return 'bg-violet-600 text-white'
    if (t.includes('evento') || t.includes('festa')) return 'bg-orange-500 text-white'
    return 'bg-black text-white'
}

export default async function CategoriaPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
    const resolvedParams = params instanceof Promise ? await params : params
    const slug = decodeURIComponent(resolvedParams.slug)

    const category = await getCategory(slug)
    if (!category) return notFound()

    const posts = await getPostsByCategory(slug)

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-zinc-900">
            <Header />

            {/* ESPAÇADOR PARA O HEADER FIXO */}
            <div className="h-17 md:h-19 w-full" aria-hidden />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                {/* HEADER DA CATEGORIA - POST A DIREITA */}
                <div className="w-full bg-[#fcfcfc] pt-2 pb-6 mb-6 border-b border-zinc-200">
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="h-px w-7 bg-sky-600 block" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-sky-800">Categoria</span>
                        </div>
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">Post • 👁 {posts.length}</span>
                    </div>
                    <h1 className="mt-4 text-[28px] font-bold leading-none tracking-tight text-[#132a3a] sm:text-[32px]">{category.nome}</h1>
                </div>

                {posts.length === 0 ? (
                    <div className="bg-white border border-zinc-200 rounded-[20px] p-12 text-center">
                        <p className="text-sm text-zinc-500">Nenhum post nessa categoria ainda.</p>
                        <Link href="/" className="mt-4 inline-block px-5 py-2 rounded-full bg-black text-white text-xs font-bold">VOLTAR PARA HOME</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {posts.map((post: any) => {
                            const views = post.views ?? post.views_count ?? 0
                            const likes = post.likes_count ?? post.likes ?? 0
                            const tipoLabel = getTipoLabel(post.tipo)
                            const tipoStyle = getTipoStyle(post.tipo)

                            return (
                                <Link key={post.id} href={`/post/${post.slug || post.id}`} className="group relative bg-white border border-zinc-200 rounded-[20px] overflow-hidden hover:shadow-lg transition flex flex-col">
                                    {/* IMAGEM + BADGES SOBREPOSTOS */}
                                    <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden">
                                        {post.thumbnail_url || post.media_url ? (
                                            <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center font-bold text-xs bg-zinc-100">{post.tipo}</div>
                                        )}

                                        {/* BADGE DO TIPO - CANTO SUPERIOR ESQUERDO */}
                                        <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest ${tipoStyle}`}>
                                            {tipoLabel}
                                        </span>

                                        {/* CORAÇÃO + LIKES - CANTO SUPERIOR DIREITO (SÓ SE TIVER LIKE) */}
                                        {likes > 0 && (
                                            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow">
                                                <svg className="size-3.5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                {likes}
                                            </span>
                                        )}
                                    </div>

                                    {/* CONTEÚDO */}
                                    <div className="p-4 flex flex-col flex-1">
                                        {/* VISUALIZAÇÕES ANTES DO TÍTULO */}
                                        <div className="mb-2 flex items-center gap-1 text-[11px] text-zinc-500">
                                            <span>👁 {views} visualizações</span>
                                        </div>

                                        <h3 className="font-semibold text-[14px] leading-tight line-clamp-2 group-hover:text-violet-600 transition">{post.titulo}</h3>

                                        {post.descricao && (
                                            <p className="text-[12px] text-zinc-500 line-clamp-2 mt-1.5">{post.descricao}</p>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    )
}
