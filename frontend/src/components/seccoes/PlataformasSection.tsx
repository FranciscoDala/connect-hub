import Link from 'next/link'

type Post = any

function formatKz(v?: number | null) {
    if (v == null) return null
    return Number(v).toLocaleString('pt-AO') + ' Kz'
}

export default function PlataformasSection({ posts }: { posts: Post[] }) {
    const lista = posts.filter((p: any) => {
        const status = (p.status || '').toLowerCase()
        const tipo = (p.tipo || '').toLowerCase()
        return status === 'published' && ['plataforma','app','site','sistema','saas','projeto','case'].includes(tipo)
    }).slice(0, 6)

    return (
        <section id="plataformas" className="bg-[#0f172a] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-sky-400" />
                            <p className="text-xs font-bold uppercase tracking-widest text-sky-400">NOSSAS PLATAFORMAS</p>
                        </div>
                        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Apps e sites que criamos e mantemos.</h2>
                        <p className="mt-4 text-sm leading-6 text-slate-400">Da ideia ao deploy. Produtos próprios em produção e projetos entregues para clientes em Angola.</p>
                    </div>
                </div>

                {lista.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-20 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800"><span className="text-lg">🚀</span></div>
                        <h3 className="mt-5 text-base font-semibold text-white">Nenhum SaaS, App ou site disponível</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">No momento não temos plataformas publicadas. Estamos preparando novidades.</p>
                    </div>
                ) : (
                    <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {lista.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const hrefPost = `/post/${item.slug || item.id}`
                            const categoria = (item.categoria?.nome || item.category?.nome || item.categoria_nome || item.tipo || 'APP').toUpperCase()

                            const rawEstado = (item.estado || item.status_plataforma || item.situacao || '').toLowerCase()
                            const emUtilizacao =
                                item.em_utilizacao === true ||
                                item.em_producao === true ||
                                ['em utilizacao','em_utilizacao','ativo','producao','utilizacao'].includes(rawEstado)

                            return (
                                <div key={item.id} className="group relative flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-slate-800 bg-[#1a2336] transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-700 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] lg:min-w-0">
                                    <Link href={hrefPost} className="relative w-full overflow-hidden bg-slate-800" style={{ aspectRatio: '16 / 10' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
                                        <div className="absolute inset-0 bg-linear-to-t from-[#10192b] via-[#10192b]/60 to-transparent" />

                                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            <span className="rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 text-[10px] font-bold capitalize tracking-widest text-white">
                                                {categoria}
                                            </span>
                                            <span className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md border border-white/10 ${emUtilizacao ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                {emUtilizacao ? '● Em utilização' : '● Em desenvolvimento'}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="flex flex-1 flex-col p-6">
                                        <Link href={hrefPost}>
                                            <h3 className="text-[17px] font-semibold leading-[1.3] text-white group-hover:text-sky-300 wrap-break-word whitespace-normal">
                                                {item.titulo}
                                            </h3>
                                        </Link>
                                        <p className="mt-3 line-clamp-2 min-h-12 flex-1 text-[13.5px] leading-6 text-slate-400">
                                            {item.descricao || ''}
                                        </p>

                                        <div className="mt-6 flex items-center justify-between gap-3">
                                            <Link href={hrefPost} className="text-[13px] font-semibold text-slate-400 transition group-hover:text-white">
                                                Ver plataforma →
                                            </Link>
                                            {item.link_url ? (
                                                <a href={item.link_url} target="_blank" className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-95">
                                                    Ver site completo
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-500">{item.preco ? `A partir de ${formatKz(item.preco)}/mês` : ''}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <style>{`#plataformas div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}
