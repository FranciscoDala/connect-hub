export default function ParceriasSection() {
    const items = [
        { icon: '🏢', title: 'Integração Corporativa', desc: 'Empresas e Provedores de Tecnologia', badge: 'CORPORATIVO', color: 'bg-sky-600' },
        { icon: '🌐', title: 'Distribuição Global', desc: 'Distribuidores Regionais de Tecnologia', badge: 'GLOBAL', color: 'bg-violet-600' },
        { icon: '📈', title: 'Estratégia de Investimento', desc: 'Capital de Risco e Private Equity', badge: 'INVEST', color: 'bg-emerald-600' },
        { icon: '🤝', title: 'Parcerias Acadêmicas', desc: 'Instituições de Pesquisa e Inovação', badge: 'P&D', color: 'bg-orange-500' },
    ]

    return (
        <section className="bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">PARCERIAS ESTRATÉGICAS</p>
                        <span className="h-px w-8 bg-sky-600" />
                    </div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">Colabore para o Futuro.</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                        Colaboramos ativamente com organizações de tecnologia, instituições de pesquisa, empresas de software e investidores estratégicos em todo o mundo.
                    </p>
                </div>

                <div className="mx-auto mt-6 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, i) => (
                        <div key={i} className="group relative flex flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:shadow-lg">
                            {/* TOPO COM BADGES IGUAL PRODUTOS */}
                            <div className="relative flex h-36 w-full items-center justify-center bg-zinc-50">
                                {/* ESQUERDA - CATEGORIA */}
                                <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest text-white shadow ${item.color}`}>
                                    {item.badge}
                                </span>

                                {/* DIREITA */}
                                <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold tracking-widest text-zinc-600 shadow border">
                                    PARCERIA
                                </span>

                                {/* ICONE GRANDE CENTRAL */}
                                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white border border-zinc-200 shadow-sm text-4xl transition duration-500 group-hover:scale-110">
                                    {item.icon}
                                </div>
                            </div>

                            {/* CONTEÚDO - MESMO ESTILO PRODUTOS */}
                            <div className="flex flex-1 flex-col p-4 text-center">
                                <div className="mb-2 flex items-center justify-center gap-1 text-[11px] text-zinc-500">
                                    <span>👁 Estratégico</span>
                                </div>
                                <h3 className="text-[14px] font-semibold leading-tight text-zinc-900 group-hover:text-violet-600">
                                    {item.title}
                                </h3>
                                <p className="mt-1.5 text-[12px] leading-5 text-zinc-500">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
