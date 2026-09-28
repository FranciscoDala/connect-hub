// app/categoria/[slug]/page.tsx
import Link from 'next/link'
import Header from '@/components/Header'
import { notFound } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getCategory(slug: string) {
    const res = await fetch(`${API}/api/v1/categories/slug/${slug}`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    return res.json()
}

async function getPostsByCategory(slug: string) {
    const res = await fetch(`${API}/api/v1/categories/slug/${slug}/posts?limit=50`, { next: { revalidate: 30 } })
    if (!res.ok) return []
    return res.json()
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
    const category = await getCategory(params.slug)
    if (!category) return notFound()

    const posts = await getPostsByCategory(params.slug)

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-zinc-900">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                {/* HEADER CATEGORIA */}
                <div className="bg-white border border-zinc-200 rounded-[24px] p-6 md:p-8 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: category.cor || '#7c3aed' }} />
                        <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-500">CATEGORIA</span>
                    </div>
                    <h1 className="text-[28px] md:text-[40px] font-black tracking-tight leading-[0.9]">{category.nome}</h1>
                    {category.descricao && <p className="text-zinc-600 mt-3 max-w-2xl text-[14px]">{category.descricao}</p>}
                    <p className="text-[12px] text-zinc-400 mt-4">{posts.length} posts encontrados</p>
                </div>

                {posts.length === 0 ? (
                    <div className="bg-white border border-zinc-200 rounded-[20px] p-12 text-center">
                        <p className="text-sm text-zinc-500">Nenhum post nessa categoria ainda.</p>
                        <Link href="/" className="mt-4 inline-block px-5 py-2 rounded-full bg-black text-white text-xs font-bold">VOLTAR PARA HOME</Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts.map((post: any) => {
                            const views = post.views ?? post.views_count ?? 0
                            const comments = post.comments_count ?? 0
                            const shares = post.shares_count ?? 0
                            return (
                                <Link key={post.id} href={`/post/${post.slug || post.id}`} className="group bg-white border border-zinc-200 rounded-[20px] overflow-hidden hover:shadow-lg transition">
                                    <div className="aspect-[16/10] bg-zinc-100 overflow-hidden">
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
        </main>
    )
}
