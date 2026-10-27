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
                                <Link key={item.id} href={link} className="group relative flex w-full min-w-full shrink-0 snap-center overflow-hidden rounded-[28px] bg-slate-200 lg:min-w-0" style={{ aspectRatio: '3 / 4.2' }}>
                                    {/* IMAGEM FULL */}
                                    <img src={img} alt={item.titulo} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />

                                    {/* GRADIENTE IGUAL PRINT */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f7d9a] via-[#0f7d9a]/60 via-40% to-transparent to-65%" />

                                    {/* CONTEUDO */}
                                    <div className="relative mt-auto flex w-full flex-col gap-3 p-4">
                                        {/* TITULO PEQUENO */}
                                        <h3 className="max-w-[85%] text-[28px] font-bold leading-[0.95] tracking-tight text-white drop-shadow">
                                            {item.titulo}
                                        </h3>

                                        {/* FOOTER IGUAL PRINT */}
                                        <div className="flex items-end gap-2.5">
                                            {/* CAIXINHA DATA */}
                                            <div className="flex w-[52px] shrink-0 flex-col overflow-hidden rounded-[10px] bg-white text-center shadow">
                                                <span className="bg-[#0a4a5a] py-1 text-[10px] font-bold leading-none text-white">{month}</span>
                                                <span className="py-1 text-[18px] font-extrabold leading-none text-black">{day}</span>
                                                <span className="pb-1 text-[9px] font-bold leading-none text-neutral-500">{week}</span>
                                            </div>

                                            <div className="min-w-0 flex-1 leading-tight">
                                                <p className="truncate text-[12px] font-semibold text-white/90">
                                                    {item.category?.nome || 'Loja Connect'}
                                                </p>
                                                <p className="truncate text-[11px] leading-[1.2] text-white/70">
                                                    {emPromo ? `${formatKz(item.preco_promocional)} • Promo` : item.preco ? formatKz(item.preco) : 'Disponível agora'}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right leading-tight">
                                                <p className="text-[11px] font-bold text-white">{emPromo ? 'PROMO' : 'VER'}</p>
                                                <p className="text-[10px] text-white/70">DETALHES</p>
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
