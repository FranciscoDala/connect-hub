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
    views?: number;
    views_count?: number;
    likes_count?: number;
    likes?: number;
}

function getTipoLabel(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('prod')) return 'PRODUTO'
    if (t.includes('noticia')) return 'NOTÍCIA'
    if (t.includes('serv')) return 'SERVIÇO'
    if (t.includes('evento') || t.includes('festa')) return 'EVENTO'
    return (tipo || 'NOTÍCIA').toUpperCase()
}

function getTipoStyle(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('prod')) return 'bg-emerald-600 text-white'
    if (t.includes('noticia')) return 'bg-sky-600 text-white'
    if (t.includes('serv')) return 'bg-violet-600 text-white'
    if (t.includes('evento') || t.includes('festa')) return 'bg-orange-500 text-white'
    return 'bg-black text-white'
}

function formatDate(dateStr: string) {
    if (!dateStr) return null
    try {
        return new Date(dateStr).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    } catch {
        return null
    }
}

export default function NoticiasSection({ posts, hideHeader = false }: { posts: Post[]; hideHeader?: boolean }) {
    const noticias = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && (tipo === 'noticia' || tipo === 'news')
        })
        .slice(0, 8)

    if (noticias.length === 0) return null

    return (
        <section id="noticias" className={`${hideHeader ? 'bg-transparent pt-2 pb-10' : 'bg-white py-10 sm:py-16'}`}>
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                {!hideHeader && (
                    <div className="mb-10">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-blue-500" />
                            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">NOTÍCIAS E MÍDIA</p>
                        </div>
                        <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-4xl">Últimas atualizações da empresa.</h2>
                    </div>
                )}
                <div className={`${hideHeader ? 'mt-2' : 'mt-0'} flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                    {noticias.map(post => {
                        const dataFormatada = formatDate(post.created_at)
                        const img = post.thumbnail_url || post.media_url || "/connect.png"
                        const href = `/post/${post.slug || post.id}`
                        const views = post.views ?? post.views_count ?? 0
                        const likes = post.likes_count ?? post.likes ?? 0
                        const tipoLabel = getTipoLabel(post.tipo)
                        const tipoStyle = getTipoStyle(post.tipo)

                        return (
                            <Link key={post.id} href={href} className="group relative flex w-full min-w-full snap-center shrink-0 flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:shadow-lg lg:min-w-0">
                                {/* IMAGEM + BADGES */}
                                <div className="relative w-full overflow-hidden bg-zinc-100" style={{ aspectRatio: '16 / 10' }}>
                                    <img src={img} alt={post.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />

                                    {/* BADGE NOTÍCIA + DATA DA POSTAGEM */}
                                    <div className="absolute left-2 top-2 flex items-center gap-1.5">
                                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest ${tipoStyle}`}>
                                            {tipoLabel}
                                        </span>
                                        {dataFormatada && (
                                            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold tracking-widest text-zinc-800 shadow backdrop-blur">
                                                📅 {dataFormatada}
                                            </span>
                                        )}
                                    </div>

                                    {/* CORAÇÃO + LIKES */}
                                    {likes > 0 && (
                                        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow backdrop-blur">
                                            <svg className="size-3.5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                            {likes}
                                        </span>
                                    )}
                                </div>

                                {/* CONTEÚDO */}
                                <div className="flex flex-1 flex-col p-4">
                                    {/* VISUALIZAÇÕES + DATA ANTES DO TÍTULO */}
                                    <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-500">
                                        <span>👁 {views} visualizações</span>
                                        <span className="size-1 rounded-full bg-zinc-300" />
                                        <span>{dataFormatada}</span>
                                    </div>

                                    <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight text-zinc-900 group-hover:text-violet-600">{post.titulo}</h3>
                                    {post.descricao && (
                                        <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-zinc-500">{post.descricao}</p>
                                    )}
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
