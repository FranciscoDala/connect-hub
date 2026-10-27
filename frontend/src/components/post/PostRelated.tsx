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
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p>
                </div>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2>

                {produtos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full border bg-white text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none' }}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            const preco = emPromo ? item.preco_promocional : item.preco
                            const cat = item.category?.nome || 'Produto'

                            return (
                                <Link key={item.id} href={link} className="group flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-[36px] bg-[#fffaf0] shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 lg:min-w-0">
                                    {/* IMAGEM TOPO AMARELA IGUAL PRINT */}
                                    <div className="relative w-full overflow-hidden" style={{ backgroundColor: '#ffd88f', aspectRatio: '4 / 3' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover" />
                                    </div>

                                    {/* CONTEUDO BRANCO */}
                                    <div className="flex flex-1 flex-col bg-white px-5 pb-5 pt-4">
                                        <h3 className="line-clamp-1 text-[22px] font-bold leading-tight text-[#1f1f1f]">{item.titulo}</h3>

                                        {/* TAGS PEQUENAS IGUAL VEGAN GLUTEN FREE */}
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="text-[11px] text-neutral-400">{cat}</span>
                                            <span className="text-[11px] text-neutral-400">{emPromo ? 'Em promoção' : 'Novo'}</span>
                                            <span className="text-[11px] text-neutral-400">Original</span>
                                        </div>

                                        <p className="mt-4 line-clamp-2 text-[13px] leading-5 text-neutral-500">
                                            {item.descricao || 'Produto original com garantia e entrega rápida em todo o país.'}
                                        </p>

                                        {/* TOPPINGS PILLS */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-[11px] text-neutral-500">Tags</span>
                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-600">{cat}</span>
                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-600">Top</span>
                                        </div>

                                        {/* PREÇO + BOTÃO IGUAL PRINT */}
                                        <div className="mt-5 flex items-end justify-between gap-3">
                                            <div className="leading-none">
                                                <p className="text-[22px] font-bold text-[#d49a1e]">{preco ? formatKz(preco) : '$10.00'}</p>
                                                {emPromo && <p className="mt-1 text-[11px] line-through text-neutral-400">{formatKz(item.preco)}</p>}
                                                <p className="mt-1 text-[11px] text-neutral-500">+ entrega</p>
                                            </div>

                                            <span className="rounded-full bg-[#fbbf24] px-6 py-2.5 text-[13px] font-bold text-[#1f1f1f] shadow-sm transition group-hover:bg-[#f5b60f]">
                                                Add to cart
                                            </span>
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
