import { getPosts, getApps } from '@/lib/api'

export default async function Home() {
    const posts = await getPosts()
    const apps = await getApps()

    return (
        <main className="min-h-screen bg-white text-zinc-900 p-8">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 bg-white border border-zinc-200 rounded-full px-6 py-3 shadow-sm">
                <div className="flex items-center">
                    <img src="/connect.png" alt="CONNECT" className="h-7 w-auto object-contain" />
                </div>
                <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-600">
                    <span className="hover:text-black cursor-pointer transition">IMPULSO</span>
                    <span className="hover:text-black cursor-pointer transition">PROOF SYSTEM</span>
                    <span className="hover:text-black cursor-pointer transition">USE CASES</span>
                    <span className="hover:text-black cursor-pointer transition">SUCCESS CASES</span>
                    <span className="hover:text-black cursor-pointer transition">PARA PROFISSIONAIS</span>
                </nav>
                <button className="px-7 py-2 rounded-full bg-white border border-zinc-900 text-black text-xs font-bold tracking-widest hover:bg-zinc-100 transition">
                    LOGIN
                </button>
            </header>
            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
                <div className="col-span-8">
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
                <div className="col-span-4">
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
