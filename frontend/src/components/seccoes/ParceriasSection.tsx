export default function ParceriasSection() {
    return (
        <section className="bg-slate-50 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">PARCERIAS ESTRATÉGICAS</p>
                        <span className="h-px w-8 bg-sky-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-800 sm:text-5xl">Colabore para o Futuro.</h2>
                    <p className="mt-6 text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                        Colaboramos ativamente com organizações de tecnologia, instituições de pesquisa, empresas de software e investidores estratégicos em todo o mundo.
                    </p>
                </div>
                <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><h3 className="mt-3 text-sm font-semibold">Integração Corporativa</h3><p className="mt-1.5 text-xs text-slate-400">Empresas e Provedores</p></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><h3 className="mt-3 text-sm font-semibold">Distribuição Global</h3><p className="mt-1.5 text-xs text-slate-400">Distribuidores Regionais</p></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><h3 className="mt-3 text-sm font-semibold">Estratégia de Investimento</h3><p className="mt-1.5 text-xs text-slate-400">Capital de Risco</p></div>
                </div>
            </div>
        </section>
    )
}
