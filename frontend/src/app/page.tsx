import { getPosts, getApps } from '@/lib/api'
import Header from '@/components/Header'

export default async function Home() {
    const posts = await getPosts()
    const apps = await getApps()

    return (
        <main className="min-h-screen bg-white text-zinc-900">
            <Header />

            <div className="px-4 sm:px-6 lg:px-8">
                <section className="relative max-w-6xl mx-auto mt-6 md:mt-8 mb-12 md:mb-16 rounded-3xl md:rounded-4xl overflow-hidden border border-zinc-200 bg-zinc-50">
                    {/* CORRIGIDO AQUI */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-size-[40px_40px] opacity-40" />
                    <div className="absolute -top-32 -left-32 size-125 bg-violet-300 rounded-full blur-[120px] opacity-30" />
                    <div className="absolute -bottom-32 -right-32 size-125 bg-blue-300 rounded-full blur-[120px] opacity-30" />

                    <div className="relative grid grid-cols-12 gap-8 p-6 sm:p-10 md:p-16 items-center">
                        <div className="col-span-12 md:col-span-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-2.5 tracking-widest uppercase font-bold mb-6 shadow-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                NOVO • PLATAFORMA CONNECT-TICS
                            </div>
                            {/* CORRIGIDO AQUI bg-linear */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.9] text-zinc-900">
                                Inovamos<br />
                                para <span className="bg-linear-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">liderar</span><br />
                                o futuro.
                            </h1>
                            <p className="mt-6 text-zinc-600 max-w-xl text-sm md:text-base leading-relaxed">
                                Conectamos impulso, proof system e cases reais em um único hub de tecnologia angolana. Construa, valide e escale seus produtos.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button className="px-8 py-3 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-widest hover:bg-black transition">COMEÇAR AGORA</button>
                                <button className="px-8 py-3 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-bold tracking-widest hover:bg-zinc-50 transition">VER USE CASES</button>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-5 relative mt-6 md:mt-0">
                            <div className="relative bg-white rounded-[20px] border border-zinc-200 p-4 shadow-xl">
                                <div className="flex gap-1.5 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="space-y-3 font-mono text-2.75">
                                    <div className="h-3 w-3/4 bg-zinc-100 rounded" />
                                    <div className="h-3 w-full bg-violet-100 rounded" />
                                    <div className="h-3 w-5/6 bg-zinc-100 rounded" />
                                    <div className="p-3 rounded-xl bg-zinc-900 text-green-400">
                                        ✓ build success<br/>✓ deploy connect.ao<br/>→ live in 0.8s
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-8 pb-12">
                <div className="col-span-12 md:col-span-8">
                    <h2 className="text-xl font-bold mb-4">Feed / Portfolio</h2>
                    <div className="grid gap-4">
                        {posts.map((p: any) => (
                            <div key={p.id} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 hover:shadow-md transition">
                                <span className="text-xs uppercase text-violet-600 font-semibold">{p.tipo}</span>
                                <h3 className="text-lg font-bold mt-2 text-zinc-900">{p.titulo}</h3>
                                <p className="text-zinc-600 text-sm mt-1">{p.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                    <h2 className="text-xl font-bold mb-4">Nossos Apps</h2>
                    <div className="grid gap-3">
                        {apps.map((a: any) => (
                            <div key={a.id} className="p-4 rounded-xl bg-zinc-900 text-white hover:bg-black cursor-pointer transition">
                                <h4 className="font-bold">{a.nome}</h4>
                                <p className="text-xs opacity-80">{a.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
