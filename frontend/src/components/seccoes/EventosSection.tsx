import Link from 'next/link'

type Post = any

function formatData(d?: string) {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }).toUpperCase()
}

export default function EventosSection({ posts }: { posts: Post[] }) {
    const eventos = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && tipo === 'evento'
        })
        .sort((a, b) => new Date(a.data_inicio || a.created_at).getTime() - new Date(b.data_inicio || b.created_at).getTime())
        .slice(0, 8)

    return (
        <section id="eventos" className="bg-white pt-10 sm:pt-18">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">PRÓXIMOS EVENTOS</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Eventos e formações exclusivas.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                    Participe dos nossos workshops, lançamentos e formações presenciais e online em todo o país.
                </p>

                {eventos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white border text-slate-400">📅</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem eventos no momento</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {eventos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const data = formatData(item.data_inicio)
                            return (
                                <Link key={item.id} href={link} className="group flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-md lg:min-w-0">
                                    <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '4 / 3' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                        {data && <span className="absolute left-3 top-3 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-bold text-white">{data}</span>}
                                        {item.modalidade && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase">{item.modalidade}</span>}
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">{item.titulo}</h3>
                                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                            {item.local_evento ? `${item.local_evento} • ${item.cidade || ''}` : item.descricao?.slice(0, 80) || ''}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                            {item.cidade && <span>📍 {item.cidade}</span>}
                                            {item.capacidade > 0 && <span>• {item.inscritos_count || 0}/{item.capacidade}</span>}
                                        </div>
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-sky-600">Ver evento <span>→</span></span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <style>{`#eventos div::-webkit-scrollbar{display:none}`}</style>
        </section>
    )
}
