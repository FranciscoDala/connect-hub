export default function EquipeSection() {
    return (
        <section id="equipe" className="bg-slate-100 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">LIDERANÇA</p>
                        <span className="h-px w-8 bg-sky-600" />
                    </div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">CEO</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Guiados por décadas de experiência na indústria de tecnologia, logística global e conformidade regulatória internacional.</p>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <div className="group relative flex w-full max-w-sm flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:shadow-lg">
                        {/* IMAGEM + BADGES - MESMO PADRÃO */}
                        <div className="relative w-full overflow-hidden bg-zinc-100" style={{ aspectRatio: '16 / 10' }}>
                            <img src="/team/ceo.jpeg" alt="CEO" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />

                            {/* ESQUERDA - CATEGORIA */}
                            <div className="absolute left-2 top-2 flex items-center gap-1.5">
                                <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-bold tracking-widest text-white shadow">
                                    CEO
                                </span>
                                <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[9px] font-bold tracking-widest text-white shadow">
                                    FUNDADOR
                                </span>
                            </div>

                            {/* DIREITA - BADGE EXTRA */}
                            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-zinc-800 shadow backdrop-blur">
                                Direção
                            </span>
                        </div>

                        {/* CONTEÚDO - MESMO PADRÃO */}
                        <div className="flex flex-1 flex-col p-4">
                            {/*<div className="mb-2 flex items-center gap-1 text-[11px] text-zinc-500">
                                <span>Eng. de Telecomunicações</span>
                            </div>
                            */}
                            <h3 className="text-[14px] font-semibold leading-tight text-zinc-900 group-hover:text-violet-600">
                                Francisco J.M Dala
                            </h3>
                            <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-zinc-500">
                                Fundador e CEO da Connect Tics. Formação em Engenharia Informática e mais de 5 anos de liderança em tecnologia em Angola, fundou a empresa em 2021 combinando visão global com conhecimento do mercado local.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
