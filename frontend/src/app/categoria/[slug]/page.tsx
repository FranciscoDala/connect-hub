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
                            const comments = post.comments_count ?? 0
                            const shares = post.shares_count ?? 0
                            return (
                                <Link key={post.id} href={`/post/${post.slug || post.id}`} className="group bg-white border border-zinc-200 rounded-[20px] overflow-hidden hover:shadow-lg transition">
                                    <div className="aspect-16/10 bg-zinc-100 overflow-hidden">
                                        {post.thumbnail_url || post.media_url ? <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" /> : <div className="w-full h-full grid place-items-center font-bold text-xs">{post.tipo}</div>}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-[14px] leading-tight line-clamp-2 group-hover:text-violet-600 transition">{post.titulo}</h3>
                                        <p className="text-[12px] text-zinc-500 line-clamp-2 mt-1">{post.descricao}</p>
                                        <div className="grid grid-cols-3 gap-1.5 mt-3">
                                            <span className="flex items-center justify-center gap-1 bg-zinc-50 border px-2 py-2 rounded-full text-[11px] w-full">👁 {views}</span>
                                            <span className="flex items-center justify-center gap-1 bg-zinc-50 border px-2 py-2 rounded-full text-[11px] w-full">💬 {comments}</span>
                                            <span className="flex items-center justify-center gap-1 bg-zinc-50 border px-2 py-2 rounded-full text-[11px] w-full">↗ {shares}</span>
                                        </div>
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
