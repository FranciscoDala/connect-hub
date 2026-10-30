import Link from 'next/link'

type Post = any

function formatKz(v?: number | null) {
    if (v === null || v === undefined) return null
    return Number(v).toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz'
}

function getTipoLabel(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('prod')) return 'PRODUTO'
    if (t.includes('noticia')) return 'NOTÍCIA'
    if (t.includes('serv')) return 'SERVIÇO'
    if (t.includes('evento') || t.includes('festa')) return 'EVENTO'
    return (tipo || 'PRODUTO').toUpperCase()
}

function getTipoStyle(tipo: string) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('prod')) return 'bg-emerald-600 text-white'
    if (t.includes('noticia')) return 'bg-sky-600 text-white'
    if (t.includes('serv')) return 'bg-violet-600 text-white'
    if (t.includes('evento') || t.includes('festa')) return 'bg-orange-500 text-white'
    return 'bg-black text-white'
}

export default function ProdutosSection({ posts, hideHeader = false }: { posts: Post[]; hideHeader?: boolean }) {
    const produtos = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && (tipo === 'produto' || tipo === 'product')
        })
        .slice(0, 8)

    return (
        <section id="produtos" className={`${hideHeader ? 'bg-transparent pt-2 pb-10' : 'bg-white py-10 sm:py-18'}`}>
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                {!hideHeader && (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-sky-600" />
                            <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p>
                        </div>
                        <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2>
                        <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                            Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                        </p>
                    </>
                )}

                {produtos.length === 0 ? (
                    <div className={`${hideHeader ? 'mt-2' : 'mt-10'} flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-20`}>
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white border text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className={`${hideHeader ? 'mt-2' : 'mt-10'} flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            const views = item.views ?? item.views_count ?? 0
                            const likes = item.likes_count ?? item.likes ?? 0
                            const tipoLabel = getTipoLabel(item.tipo)
                            const tipoStyle = getTipoStyle(item.tipo)

                            return (
                                <Link key={item.id} href={link} className="group relative flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:shadow-lg lg:min-w-0">
                                    {/* IMAGEM + BADGES */}
                                    <div className="relative w-full overflow-hidden bg-zinc-100" style={{ aspectRatio: '16 / 10' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />

                                        {/* BADGE TIPO - ESQUERDA */}
                                        <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest ${tipoStyle}`}>
                                            {tipoLabel}
                                        </span>

                                        {/* DIREITA - PROMO + LIKES */}
                                        <div className="absolute right-2 top-2 flex items-center gap-1.5">
                                            {emPromo && <span className="rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-bold text-white shadow">PROMOÇÃO</span>}
                                            {likes > 0 && (
                                                <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow backdrop-blur">
                                                    <svg className="size-3.5 fill-red-600" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                    {likes}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONTEÚDO */}
                                    <div className="flex flex-1 flex-col p-4">
                                        {/* VISUALIZAÇÕES ANTES DO TÍTULO */}
                                        <div className="mb-2 flex items-center gap-1 text-[11px] text-zinc-500">
                                            <span>👁 {views} visualizações</span>
                                        </div>

                                        <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight text-zinc-900 group-hover:text-violet-600">{item.titulo}</h3>

                                        {item.descricao && (
                                            <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-zinc-500">{item.descricao}</p>
                                        )}

                                        {item.preco && (
                                            <div className="mt-3 text-[13px] font-bold">
                                                {emPromo ? (
                                                    <>
                                                        <span className="text-red-600">{formatKz(item.preco_promocional)}</span>
                                                        <span className="ml-2 text-[11px] line-through text-zinc-400">{formatKz(item.preco)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-zinc-900">{formatKz(item.preco)}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <style>{`#produtos div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}
