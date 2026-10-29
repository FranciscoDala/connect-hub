"use client"
import Link from 'next/link'
import { useState, useRef } from 'react'

type Post = any

function formatKz(v?: number | null) {
    if (v == null) return null
    return Number(v).toLocaleString('pt-AO') + ' Kz'
}

export default function PlataformasSection({ posts }: { posts: Post[] }) {
    const lista = posts.filter((p: any) => {
        const status = (p.status || '').toLowerCase()
        const tipo = (p.tipo || '').toLowerCase()
        return status === 'published' && ['plataforma', 'app', 'site', 'sistema', 'saas', 'projeto', 'case'].includes(tipo)
    }).slice(0, 10)

    const [active, setActive] = useState(0)
    const activeItem = lista[active]

    const startX = useRef<number | null>(null)
    const startY = useRef<number | null>(null)
    const currentX = useRef<number | null>(null)
    const isDragging = useRef(false)
    const isHorizontal = useRef(false)

    const handleStart = (x: number, y: number) => {
        startX.current = x
        startY.current = y
        currentX.current = x
        isDragging.current = true
        isHorizontal.current = false
    }

    const handleMove = (x: number, y: number, e?: any) => {
        if (!isDragging.current || startX.current === null || startY.current === null) return
        currentX.current = x
        const diffX = Math.abs(x - startX.current)
        const diffY = Math.abs(y - startY.current)
        if (diffX > 10 && diffX > diffY) {
            isHorizontal.current = true
            if (e && e.cancelable) e.preventDefault()
        }
    }

    const handleEnd = () => {
        if (!isDragging.current || startX.current === null || currentX.current === null) {
            isDragging.current = false
            return
        }
        if (isHorizontal.current) {
            const diff = startX.current - currentX.current
            if (Math.abs(diff) > 50) {
                if (diff > 0) setActive((s) => (s + 1) % lista.length)
                else setActive((s) => (s - 1 + lista.length) % lista.length)
            }
        }
        startX.current = null
        startY.current = null
        currentX.current = null
        isDragging.current = false
        isHorizontal.current = false
    }

    const getCircularOffset = (i: number, active: number, len: number) => {
        let offset = i - active
        offset = ((offset % len) + len) % len
        if (offset > len / 2) offset -= len
        return offset
    }

    const prev = () => setActive((s) => (s - 1 + lista.length) % lista.length)
    const next = () => setActive((s) => (s + 1) % lista.length)

    return (
        <section id="plataformas" className="bg-[#0f172a] py-20 sm:py-28 overflow-hidden select-none">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-sky-400" />
                            <p className="text-xs font-bold uppercase tracking-widest text-sky-400">NOSSAS PLATAFORMAS</p>
                        </div>
                        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Apps e sites que criamos e mantemos.</h2>
                        <p className="mt-4 text-sm leading-6 text-slate-400">Da ideia ao deploy. Produtos próprios em produção e projetos entregues para clientes em Angola.</p>
                    </div>
                </div>

                {lista.length === 0 ? (
                    <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-20 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800"><span className="text-lg">🚀</span></div>
                        <h3 className="mt-5 text-base font-semibold text-white">Nenhum SaaS, App ou site disponível</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">No momento não temos plataformas publicadas. Estamos preparando novidades.</p>
                    </div>
                ) : (
                    <div className="relative mt-12">
                        <button onClick={prev} className="hidden sm:grid absolute left-4 lg:left-8 top-1/2 z-20 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white shadow border text-slate-600 hover:bg-black hover:text-white transition">←</button>
                        <button onClick={next} className="hidden sm:grid absolute right-4 lg:right-8 top-1/2 z-20 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white shadow border text-slate-600 hover:bg-black hover:text-white transition">→</button>

                        <div
                            className="relative flex h-100 sm:h-125 items-center justify-center gap-0 px-12 cursor-grab active:cursor-grabbing overscroll-y-contain"
                            style={{ touchAction: 'pan-y' }}
                            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY, e)}
                            onTouchEnd={handleEnd}
                            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                            onMouseUp={handleEnd}
                            onMouseLeave={handleEnd}
                        >
                            {lista.map((item: any, i: number) => {
                                const offset = getCircularOffset(i, active, lista.length)
                                const absOffset = Math.abs(offset)
                                const isActive = offset === 0

                                let transform = ''
                                let zIndex = 20 - absOffset
                                let opacity = 1
                                let filter = ''

                                if (isActive) {
                                    transform = `translateX(0px) scale(1) translateZ(0)`
                                    zIndex = 30
                                } else if (offset === -1) {
                                    transform = `translateX(-160px) scale(0.88) rotateY(18deg)`
                                    zIndex = 20
                                    filter = 'brightness(0.9)'
                                } else if (offset === 1) {
                                    transform = `translateX(160px) scale(0.88) rotateY(-18deg)`
                                    zIndex = 20
                                    filter = 'brightness(0.9)'
                                } else if (offset === -2) {
                                    transform = `translateX(-280px) scale(0.78) rotateY(25deg)`
                                    opacity = 0.75
                                    filter = 'brightness(0.8)'
                                } else if (offset === 2) {
                                    transform = `translateX(280px) scale(0.78) rotateY(-25deg)`
                                    opacity = 0.75
                                    filter = 'brightness(0.8)'
                                } else {
                                    transform = `translateX(${offset * 140}px) scale(0.6)`
                                    opacity = 0
                                }

                                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
                                if (isMobile) {
                                    if (offset === -1) transform = `translateX(-95px) scale(0.85) rotateY(15deg)`
                                    if (offset === 1) transform = `translateX(95px) scale(0.85) rotateY(-15deg)`
                                    if (offset === -2) transform = `translateX(-175px) scale(0.7) rotateY(20deg)`
                                    if (offset === 2) transform = `translateX(175px) scale(0.7) rotateY(-20deg)`
                                }

                                const img = item.thumbnail_url || item.media_url || '/connect.png'
                                const hrefPost = `/post/${item.slug || item.id}`
                                const categoria = (item.categoria?.nome || item.category?.nome || item.categoria_nome || item.tipo || 'App').toLowerCase()
                                const rawEstado = (item.estado || item.status_plataforma || item.situacao || '').toLowerCase()
                                const emUtilizacao = item.em_utilizacao === true || item.em_producao === true || ['em utilizacao', 'em_utilizacao', 'ativo', 'producao', 'utilizacao'].includes(rawEstado)

                                return (
                                    <Link
                                        key={item.id}
                                        href={hrefPost}
                                        onMouseEnter={() => !isDragging.current && setActive(i)}
                                        style={{ transform, zIndex, opacity, filter } as any}
                                        className="absolute w-65 h-65 sm:w-85 sm:h-85 aspect-square shrink-0 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                    >
                                        <img src={img} alt={item.titulo} className="absolute inset-0 h-full w-full object-cover pointer-events-none" />
                                        <div className="absolute inset-0 bg-linear-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />

                                        <div className="absolute top-4 left-4 flex items-center gap-2">
                                            <span className="rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] font-bold capitalize text-white">
                                                {categoria}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10 ${emUtilizacao ? 'bg-emerald-500/90' : 'bg-amber-500/90'}`}>
                                                {emUtilizacao ? 'Em Utilização' : 'Em Dev'}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <div className="flex items-start gap-2">
                                                <span className="h-3 w-3 rounded-full bg-sky-400 shrink-0 mt-1" />
                                                <p className="text-sm font-bold text-white leading-snug wrap-break-word whitespace-normal line-clamp-3">
                                                    {item.titulo}
                                                </p>
                                            </div>
                                            <p className="mt-2 text-[11px] text-white/70 line-clamp-2 wrap-break-word">
                                                {item.link_url ? '🌐 Ver site' : item.preco ? `A partir de ${formatKz(item.preco)}/mês` : 'Clique para saber mais'}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {activeItem && (
                            <div className="mx-auto mt-8 max-w-lg text-center px-6">
                                <h3 className="text-white font-semibold text-lg leading-snug wrap-break-word whitespace-normal">{activeItem.titulo}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400 line-clamp-3 wrap-break-word">
                                    {activeItem.descricao || 'Plataforma desenvolvida pela nossa equipe.'}
                                </p>
                                <div className="mt-4 flex justify-center gap-3">
                                    <Link href={`/post/${activeItem.slug || activeItem.id}`} className="inline-flex rounded-full bg-white px-6 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100">
                                        Ver plataforma
                                    </Link>
                                    {activeItem.link_url && (
                                        <a href={activeItem.link_url} target="_blank" className="inline-flex rounded-full bg-sky-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-sky-600">
                                            Site oficial
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-center gap-1.5">
                            {lista.map((_, i) => (
                                <button key={i} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-sky-400' : 'w-1.5 bg-slate-600'}`} />
                            ))}
                        </div>
                        <p className="mt-4 text-center text-[10px] tracking-widest text-slate-500 sm:hidden">ARRASTE PARA O LADO →</p>
                    </div>
                )}
            </div>
        </section>
    )
}
