import Link from 'next/link'

type Post = any

function formatKz(v?: number | null) {
    if (v === null || v === undefined) return null
    return Number(v).toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz'
}

export default function ProdutosRelated({ posts }: { posts: Post[] }) {
    const produtos = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && (tipo === 'produto' || tipo === 'product')
        })
        .slice(0, 8)

    return (
        <section id="produtos" className="py-2 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p>
                </div>
                <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                    Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                </p>

                {produtos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none' }}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            const d = item.created_at ? new Date(item.created_at) : new Date()
                            const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
                            const day = String(d.getDate()).padStart(2, '0')
                            const week = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()

                            return (
                                <Link key={item.id} href={link} className="group relative flex w-full min-w-full shrink-0 snap-center overflow-hidden rounded-3xl lg:min-w-0" style={{ aspectRatio: '3 / 4.2', backgroundColor: '#0e7a98' }}>
                                    <img src={img} alt={item.titulo} className="absolute inset-0 h-full w-full object-cover object-top" />
                                    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14,122,152,0.35)' }} />
                                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to top, #0b5f77 0%, rgba(14,122,152,0.95) 45%, transparent 75%)' }} />

                                    <div className="relative mt-auto flex w-full flex-col p-3.5">
                                        <h3 className="mb-3 line-clamp-2 min-h-9.5 text-[15px] font-semibold leading-[1.2] text-white">
                                            {item.titulo}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <div className="flex w-11 shrink-0 flex-col overflow-hidden rounded-lg bg-white text-center shadow-sm">
                                                <span className="py-1 text-[8px] font-bold leading-none text-white" style={{ backgroundColor: '#083a4a' }}>{month}</span>
                                                <span className="py-1 text-[15px] font-extrabold leading-none text-black">{day}</span>
                                                <span className="pb-1 text-[7px] font-bold leading-none text-neutral-500">{week}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[11px] font-semibold leading-none text-white">P.Unitário</p>
                                                <p className="mt-1 truncate text-[10px] leading-none text-white/80">
                                                    {emPromo ? formatKz(item.preco_promocional) : item.preco ? formatKz(item.preco) : 'Disponível'}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[9px] font-bold leading-none text-white">{emPromo ? 'PROMO' : 'VER'}</p>
                                                <p className="text-[8px] leading-none text-white/70">DETALHES</p>
                                            </div>
                                        </div>
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
