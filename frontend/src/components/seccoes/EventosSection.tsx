"use client"
import Link from 'next/link'
import { useState, useRef } from 'react'

type Post = any

function formatData(d?: string) {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EventosSection({ posts, hideHeader = false }: { posts: Post[]; hideHeader?: boolean }) {
    const eventos = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && tipo === 'evento'
        })
        .sort((a, b) => new Date(b.data_inicio || b.created_at).getTime() - new Date(a.data_inicio || a.created_at).getTime())
        .slice(0, 10)

    const [active, setActive] = useState(0)
    const activeItem = eventos[active]

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
                if (diff > 0) setActive((s) => (s + 1) % eventos.length)
                else setActive((s) => (s - 1 + eventos.length) % eventos.length)
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

    if (eventos.length === 0) {
        return (
            <section id="eventos" className="bg-[#f9f9f7] pt-10 sm:pt-16 pb-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    {!hideHeader && (
                        <>
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-sky-600" />
                                <p className="text-xs font-bold uppercase tracking-widest text-sky-800">PRÓXIMOS EVENTOS</p>
                            </div>
                            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Eventos e formações exclusivas.</h2>
                            <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                                Participe dos nossos workshops, lançamentos e formações presenciais e online em todo o país.
                            </p>
                        </>
                    )}
                    <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-50 border text-slate-400">📅</div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">Sem eventos no momento</p>
                    </div>
                </div>
            </section>
        )
    }

    const prev = () => setActive((s) => (s - 1 + eventos.length) % eventos.length)
    const next = () => setActive((s) => (s + 1) % eventos.length)

    return (
        <section id="eventos" className="bg-[#f9f9f7] pt-10 sm:pt-16 pb-20 overflow-hidden select-none">
            {!hideHeader && (
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-800">PRÓXIMOS EVENTOS</p>
                    </div>
                    <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Eventos e formações exclusivas.</h2>
                    <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                        Participe dos nossos workshops, lançamentos e formações presenciais e online em todo o país.
                    </p>
                </div>
            )}

            <div className="relative mt-12 mx-auto max-w-7xl">
                <button onClick={prev} className="hidden sm:grid absolute left-8 top-1/2 z-20 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white shadow border text-slate-600 hover:bg-black hover:text-white transition">←</button>
                <button onClick={next} className="hidden sm:grid absolute right-8 top-1/2 z-20 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white shadow border text-slate-600 hover:bg-black hover:text-white transition">→</button>

                <div
                    className="relative flex h-105 sm:h-120 items-center justify-center gap-0 px-12 cursor-grab active:cursor-grabbing overscroll-y-contain"
                    style={{ touchAction: 'pan-y' }}
                    onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                    onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY, e)}
                    onTouchEnd={handleEnd}
                    onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                    onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                >
                    {eventos.map((item, i) => {
                        const offset = getCircularOffset(i, active, eventos.length)
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
                        const link = `/post/${item.slug || item.id}`

                        return (
                            <Link
                                key={item.id}
                                href={link}
                                onMouseEnter={() => !isDragging.current && setActive(i)}
                                style={{ transform, zIndex, opacity, filter } as any}
                                className={`absolute w-65 sm:w-75 h-95 sm:h-105 shrink-0 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
                            >
                                <img src={img} alt={item.titulo} className="absolute inset-0 h-full w-full object-cover pointer-events-none" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-white leading-tight line-clamp-1">{item.titulo}</p>
                                        <span className="h-3 w-3 rounded-full bg-white shrink-0" />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-white/70 truncate">
                                        📍 {item.local_evento || item.cidade || 'Local a confirmar'}
                                    </p>
                                </div>
                                {item.data_inicio && (
                                    <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold backdrop-blur">
                                        {formatData(item.data_inicio)}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="mx-auto mt-8 max-w-lg text-center px-6">
                    <p className="text-sm leading-6 text-slate-500 line-clamp-2">
                        {activeItem?.descricao?.slice(0, 140) || `${activeItem?.titulo} - ${activeItem?.local_evento || ''} em ${activeItem?.cidade || 'Angola'}.`}
                    </p>
                    <Link href={`/post/${activeItem?.slug || activeItem?.id}`} className="mt-4 inline-flex rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-zinc-800">Ver evento</Link>
                </div>

                <div className="mt-6 flex justify-center gap-1.5">
                    {eventos.map((_, i) => (
                        <button key={i} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-sky-600' : 'w-1.5 bg-slate-300'}`} />
                    ))}
                </div>
                <p className="mt-4 text-center text-[10px] tracking-widest text-slate-400 sm:hidden">ARRASTE PARA O LADO →</p>
            </div>
        </section>
    )
}
