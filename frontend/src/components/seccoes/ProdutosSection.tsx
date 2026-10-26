import Link from 'next/link'
type Post = any
function formatKz(v?: number | null) { if (v == null) return null; return Number(v).toLocaleString('pt-AO') + ' Kz' }
export default function ProdutosSection({ posts }: { posts: Post[] }) {
    const produtos = posts.filter((p: any) => p.status === 'published' && ['produto', 'product'].includes(p.tipo)).slice(0, 8)
    return (
        <section id="produtos" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-widest text-sky-800">APRESENTAÇÃO DE PRODUTOS</p><h2 className="mt-4 text-3xl font-semibold text-slate-700 sm:text-4xl">Produtos com tecnologias de ponta.</h2></div>
                {produtos.length === 0 ? <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed py-20"><p className="text-sm font-semibold">Sem produtos disponíveis</p></div> :
                    <div className="mt-12 flex snap-x snap-mandatory gap-0 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible" style={{ scrollbarWidth: 'none' } as any}>
                        {produtos.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            return <Link key={item.id} href={`/produto/${item.slug || item.id}`} className="group flex w-full min-w-full snap-center flex-col overflow-hidden rounded-2xl border bg-slate-50 lg:min-w-0" style={{ minWidth: '100%' }}><div className="w-full bg-slate-100" style={{ aspectRatio: '4 / 3' }}><img src={img} alt={item.titulo} className="h-full w-full object-cover" /></div><div className="p-5"><h3 className="text-sm font-semibold">{item.titulo}</h3><p className="mt-2 line-clamp-2 text-xs text-slate-500">{item.descricao}</p></div></Link>
                        })}
                    </div>}
            </div>
        </section>
    )
}
