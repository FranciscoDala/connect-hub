import { getPosts, getApps } from '@/lib/api'
export default async function Home() {
  const posts = await getPosts()
  const apps = await getApps()
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black tracking-tighter">CONNECT<span className="text-violet-500">.AO</span></h1>
        <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">API ONLINE</span>
      </header>
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <h2 className="text-xl font-bold mb-4">Feed / Portfolio</h2>
          <div className="grid gap-4">
            {posts.map((p:any)=>(
              <div key={p.id} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs uppercase text-violet-400">{p.tipo}</span>
                <h3 className="text-lg font-bold mt-2">{p.titulo}</h3>
                <p className="text-zinc-400 text-sm mt-1">{p.descricao}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4">
          <h2 className="text-xl font-bold mb-4">Nossos Apps</h2>
          <div className="grid gap-3">
            {apps.map((a:any)=>(
              <div key={a.id} className="p-4 rounded-xl bg-violet-600 hover:bg-violet-500 cursor-pointer transition">
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
