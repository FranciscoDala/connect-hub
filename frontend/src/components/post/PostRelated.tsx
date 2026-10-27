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
                                <Link
                                    key={item.id}
                                    href={link}
                                    className="group flex w-full min-w-70 max-w-90 shrink-0 snap-center flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all hover:-translate-y-1 lg:min-w-0 lg:max-w-none lg:w-full"
                                >
                                    {/* IMAGEM QUADRADA 1/1 */}
                                    <div className="relative w-full shrink-0 overflow-hidden rounded-t-3xl" style={{ backgroundColor: '#ffd88f', aspectRatio: '1 / 1' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover" />
                                    </div>

                                    {/* CONTEUDO - ALTURA AUTO */}
                                    <div className="flex flex-1 flex-col px-5 pb-4 pt-4" style={{ backgroundColor: '#fffcf5' }}>
                                        <h3 className="line-clamp-1 text-lg font-bold leading-tight" style={{ color: '#1f1f1f' }}>{item.titulo}</h3>

                                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs text-neutral-600">{emPromo ? 'Em promoção' : 'Novo'}</span>
                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs text-neutral-600">Original</span>
                                        </div>

                                        <p className="mt-3 line-clamp-1 text-xs leading-5 text-neutral-500">
                                            {item.descricao || 'Produto original com garantia e entrega rápida.'}
                                        </p>

                                        <div className="mt-2.5 flex items-center gap-2">
                                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs text-neutral-600">{cat}</span>
                                        </div>

                                        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                                            <div className="leading-none">
                                                <p className="text-lg font-bold leading-tight" style={{ color: '#d49a1e' }}>{preco ? formatKz(preco) : '56 000 Kz'}</p>
                                                <p className="mt-1 text-xs text-neutral-500">+ entrega</p>
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
