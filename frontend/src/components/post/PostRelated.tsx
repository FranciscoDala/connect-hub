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
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                    Descubra nossos dispositivos de ponta, projetados para aprimorar sua prática com tecnologia inovadora e resultados clínicos comprovados.
                </p>

                {produtos.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="grid size-12 place-items-center rounded-full border bg-white text-slate-400">📦</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem produtos disponíveis</p>
                    </div>
                ) : (
                    <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as any}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = `/post/${item.slug || item.id}`
                            const emPromo = item.em_promocao && item.preco_promocional
                            const titulo = item.titulo || 'Produto'
                            // split tipo print: primeira linha bold, segunda cinza
                            const palavras = titulo.split(' ')
                            const linha1 = palavras.slice(0, 2).join(' ')
                            const linha2 = palavras.slice(2).join(' ')
                            const tags = [
                                (item.category?.nome || item.category_name || 'ice grey').toLowerCase(),
                                item.preco ? formatKz(item.preco) : '3.2s',
                                'Manual'
                            ].filter(Boolean).slice(0,3)

                            return (
                                <Link key={item.id} href={link} className="group flex w-full min-w-full shrink-0 snap-center flex-col overflow-hidden rounded-[32px] border border-neutral-200 bg-[#f2f2f2] transition-all hover:-translate-y-1 hover:shadow-xl lg:min-w-0">
                                    {/* IMAGEM */}
                                    <div className="relative w-full overflow-hidden bg-[#e9e9e9]" style={{ aspectRatio: '4 / 3.2' }}>
                                        <img src={img} alt={item.titulo} className="size-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                                        {/* TAGS PILL igual print */}
                                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                                            {tags.map((t:any, i:number) => (
                                                <span key={i} className="rounded-full border border-black/5 bg-white/90 px-2.5 py-1 text-[10px] font-medium leading-none text-neutral-700 shadow-sm backdrop-blur">
                                                    • {t}
                                                </span>
                                            ))}
                                            {emPromo && (
                                                <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">PROMO</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONTEUDO IGUAL PRINT */}
                                    <div className="flex flex-1 flex-col bg-[#f2f2f2] px-6 pb-7 pt-5">
                                        <h3 className="text-[26px] font-bold leading-[0.95] tracking-tight text-black">
                                            {linha1}
                                            {linha2 && <span className="mt-1 block text-neutral-400">{linha2}</span>}
                                            {!linha2 && <span className="mt-1 block text-neutral-400">{item.category?.nome || ''}</span>}
                                        </h3>
                                        <p className="mt-3 line-clamp-3 text-[11px] leading-[1.4] text-neutral-500">
                                            {item.descricao || 'Timeless, iconic, and unapologetically analog — this product embodies the soul of finest era.'}
                                        </p>

                                        {item.preco && (
                                            <div className="mt-4 text-sm font-bold text-black">
                                                {emPromo ? (
                                                    <>
                                                        <span className="text-red-600">{formatKz(item.preco_promocional)}</span>
                                                        <span className="ml-2 text-xs font-medium text-neutral-400 line-through">{formatKz(item.preco)}</span>
                                                    </>
                                                ) : (
                                                    <span>{formatKz(item.preco)}</span>
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
