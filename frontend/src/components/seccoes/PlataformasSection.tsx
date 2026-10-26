import Link from 'next/link'
type Post = any
export default function PlataformasSection({ posts }: { posts: Post[] }) {
    const lista = posts.filter((p: any) => p.status === 'published' && ['plataforma', 'app', 'site', 'sistema', 'saas', 'projeto', 'case'].includes(p.tipo)).slice(0, 6)
    return (
        <section id="plataformas" className="bg-slate-900 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-sky-400">NOSSAS PLATAFORMAS</p><h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Apps e sites que criamos e mantemos.</h2></div>
                {lista.length === 0 ? (
                    <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/50 py-20 text-center">
                        <p className="text-sm font-semibold text-white">sem App, SaaS ou site disponivel</p>
                    </div>
                ) : (
                    <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:gap-6" style={{ scrollbarWidth: 'none' } as any}>
                        {lista.map((item: any) => {
                            const img = item.thumbnail_url || item.media_url || '/connect.png'
                            const link = item.link_url || `/plataforma/${item.slug || item.id}`
                            return <Link key={item.id} href={link} target={item.link_url ? '_blank' : undefined} className="group flex w-[85%] min-w-[85%] snap-center flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-800/50 lg:min-w-0"><div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}><img src={img} alt={item.titulo} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent" /></div><div className="p-6"><h3 className="text-white font-semibold">{item.titulo}</h3><p className="mt-2 text-sm text-slate-400 line-clamp-2">{item.descricao}</p></div></Link>
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
