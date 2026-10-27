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
        <section id="produtos" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2>

                {produtos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid size-12 place-items-center rounded-full border bg-white text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            const d = item.created_at ? new Date(item.created_at) : new Date()
                            const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
                            const day = String(d.getDate()).padStart(2, '0')
                            const week = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()

                            return (
                                <Link key={item.id} href={link} className="group relative flex w-full min-w-full shrink-0 snap-center overflow-hidden rounded-[28px] bg-[#e9eef2] lg:min-w-0" style={{ aspectRatio: '3 / 4.2' }}>
                                    <img src={img} alt={item.titulo} className="absolute inset-0 size-full object-cover" />

                                    {/* FUNDO CORRIGIDO - cobre 65% do card, nome nunca fica no branco */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e7a98] from-0% via-[#0e7a98]/90 via-35% to-[#0e7a98]/0 to-70%" />

                                    <div className="relative mt-auto flex w-full flex-col p-3.5">
                                        {/* NOME PEQUENO E CORTADO */}
                                        <h3 className="mb-3 line-clamp-2 min-h-[40px] text-[16px] font-semibold leading-[1.15] text-white">
                                            {item.titulo}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <div className="flex w-[46px] shrink-0 flex-col overflow-hidden rounded-[9px] bg-white text-center">
                                                <span className="bg-[#083a4a] py-[3px] text-[8px] font-bold leading-none text-white">{month}</span>
                                                <span className="py-[2px] text-[16px] font-extrabold leading-none text-black">{day}</span>
                                                <span className="pb-[3px] text-[7px] font-bold leading-none text-neutral-500">{week}</span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[11px] font-semibold leading-none text-white">Loja Connect</p>
                                                <p className="mt-[2px] truncate text-[10px] leading-none text-white/80">
                                                    {emPromo ? `${formatKz(item.preco_promocional)}` : item.preco ? formatKz(item.preco) : 'Disponível'}
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
