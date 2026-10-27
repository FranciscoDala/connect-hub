import Link from 'next/link'

type Post = any

function formatKz(v?: number | null) {
    if (v === null || v === undefined) return null
    return Number(v).toLocaleString('pt-AO', { minimumFractionDigits: 0 }) + ' Kz'
}

export default function ProdutosSection({ posts }: { posts: Post[] }) {
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
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                    Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                </p>

                {produtos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white border text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {produtos.map((item: any) => {
                            const cat = (item.category?.nome || item.category_name || 'PRODUTO').toUpperCase()
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            return (
                                <Link key={item.id} href={link} className="group flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:-translate-y-1 hover:shadow-md lg:min-w-0">
                                    <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '4 / 3' }}>
                                        <img src={img} alt={item.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                        {emPromo && <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">PROMO</span>}
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        {/*<span className="text-xs font-bold uppercase tracking-widest text-sky-600">{cat}</span>*/}
                                        <h3 className="mt-2 text-sm font-semibold text-slate-800 line-clamp-2">{item.titulo}</h3>
                                        {/*<p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-slate-500">{item.descricao || ''}</p>*/}
                                        {item.preco && <div className="mt-4 text-sm font-bold">{emPromo ? <><span className="text-red-600">{formatKz(item.preco_promocional)}</span> <span className="ml-2 text-xs line-through text-slate-400">{formatKz(item.preco)}</span></> : <span>{formatKz(item.preco)}</span>}</div>}
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-sky-600">Ver detalhes <span>→</span></span>
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
