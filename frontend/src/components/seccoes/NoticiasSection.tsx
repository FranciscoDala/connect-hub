import Link from 'next/link'

type Post = {
    id: string;
    titulo: string;
    slug?: string;
    descricao?: string;
    tipo: string;
    thumbnail_url?: string;
    media_url?: string;
    created_at: string;
    status: string;
}

export default function NoticiasSection({ posts }: { posts: Post[] }) {
    const noticias = posts.filter(p => p.status === 'published' && p.tipo === 'noticia').slice(0, 8)
    if (noticias.length === 0) return null
    return (
        <section id="noticias" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-600">NOTÍCIAS E MÍDIA</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-4xl">Últimas atualizações da empresa.</h2>
                <div className="mt-10 flex snap-x snap-mandatory gap-0 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                    {noticias.map(post => {
                        const dataFormatada = new Date(post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
                        const img = post.thumbnail_url || post.media_url || "/connect.png"
                        return (
                            <Link key={post.id} href={`/post/${post.slug || post.id}`} className="group flex w-full min-w-full snap-center shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-lg lg:min-w-0" style={{ minWidth: '100%' }}>
                                <div className="w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '16 / 10' }}>
                                    <img src={img} alt={post.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <span className="text-xs font-medium text-sky-600">{dataFormatada}</span>
                                    <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-slate-800 group-hover:text-sky-600">{post.titulo}</h3>
                                    {post.descricao && (<p className="mt-3 line-clamp-3 text-justify text-xs leading-5 text-slate-500">{post.descricao}</p>)}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <style>{`#noticias div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}
