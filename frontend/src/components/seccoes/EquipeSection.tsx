
export default function EquipeSection() {
    return (
        <section id="equipe" className="bg-slate-100 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">LIDERANÇA</p>
                        <span className="h-px w-8 bg-sky-600" />
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">CEO</h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Guiados por décadas de experiência na indústria de tecnologia, logística global e conformidade regulatória internacional.</p>
                </div>
                <div className="mt-12 flex flex-wrap justify-center gap-6">
                    <div className="flex w-full max-w-sm flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                        <div className="mx-auto overflow-hidden rounded-full border-4 border-white shadow" style={{ width: '200px', height: '200px' }}>
                            <img src="/team/ceo.jpeg" alt="CEO" className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-base font-semibold text-slate-800">Francisco J.M Dala</h3>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-sky-600">DIRETOR EXECUTIVO - CEO</p>
                        </div>
                        <div className="mt-4 space-y-3 text-justify text-xs leading-6 text-slate-500">
                            <p>Francisco Dala é o Fundador e CEO da Connect Tics. Com formação em Engenharia Informática e mais de 5 anos de liderança em tecnologia em Angola, fundou a empresa em 2021 combinando visão global de negócios com profundo conhecimento do mercado local.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
