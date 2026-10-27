"use client"
import Link from 'next/link'
import { useState, useRef } from 'react'

type Post = any

function formatData(d?: string) {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EventosSection({ posts }: { posts: Post[] }) {
    const eventos = posts
        .filter(p => {
            const status = (p.status || '').toLowerCase()
            const tipo = (p.tipo || '').toLowerCase()
            return status === 'published' && tipo === 'evento'
        })
        .sort((a, b) => new Date(a.data_inicio || a.created_at).getTime() - new Date(b.data_inicio || b.created_at).getTime())
        .slice(0, 10)

    const [active, setActive] = useState(2)
    const activeItem = eventos[active]

    // SWIPE LOGIC
    const startX = useRef<number | null>(null)
    const currentX = useRef<number | null>(null)
    const isDragging = useRef(false)

    const handleStart = (x: number) => {
        startX.current = x
        isDragging.current = true
    }
    const handleMove = (x: number) => {
        if (!isDragging.current || startX.current === null) return
        currentX.current = x
    }
    const handleEnd = () => {
        if (!isDragging.current || startX.current === null || currentX.current === null) {
            isDragging.current = false
            return
        }
        const diff = startX.current - currentX.current
        if (Math.abs(diff) > 50) {
            if (diff > 0) setActive((s) => (s + 1) % eventos.length)
            else setActive((s) => (s - 1 + eventos.length) % eventos.length)
        }
        startX.current = null
        currentX.current = null
        isDragging.current = false
    }

    if (eventos.length === 0) {
        return (
            <section id="eventos" className="bg-[#f9f9f7] pt-10 sm:pt-16 pb-20">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-sky-600" />
                        <p className="text-xs font-bold uppercase tracking-widest text-sky-800">PRÓXIMOS EVENTOS</p>
                    </div>
                    <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-700 sm:text-4xl">Eventos e formações exclusivas.</h2>
                    <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">
                        Participe dos nossos workshops, lançamentos e formações presenciais e online em todo o país.
                    </p>
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

            <div className="relative mt-12 mx-auto max-w-7xl">
                <button onClick={prev} className="hidden sm:grid absolute left-8 top-1/2 z-20 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white shadow border text-slate-600 hover:bg-black hover:text-white transition">←</button>
                <button onClick={next} className="hidden sm:grid absolute right-8 top-1/2 z-20 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white shadow border text-slate-600 hover:bg-black hover:text-white transition">→</button>

                <div
                    className="relative flex h-[420px] sm:h-[480px] items-center justify-center gap-0 touch-pan-y px-12 cursor-grab active:cursor-grabbing"
                    onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                    onTouchEnd={handleEnd}
                    onMouseDown={(e) => handleStart(e.clientX)}
                    onMouseMove={(e) => handleMove(e.clientX)}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                >
                    {eventos.map((item, i) => {
                        const offset = i - active
                        const absOffset = Math.abs(offset)
                        const isActive = i === active

                        let transform = ''
                        let zIndex = 10 - absOffset
                        let opacity = 1
                        let filter = ''

                        if (isActive) {
                            transform = `translateX(${offset * 0}px) scale(1) translateZ(0)`
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
                            opacity = 0.7
                            filter = 'brightness(0.8)'
                        } else if (offset === 2) {
                            transform = `translateX(280px) scale(0.78) rotateY(-25deg)`
                            opacity = 0.7
                            filter = 'brightness(0.8)'
                        } else {
                            transform = `translateX(${offset * 140}px) scale(0.65)`
                            opacity = 0
                        }

                        // MOBILE: junta mais os cards
                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
                        if (isMobile) {
                            if (offset === -1) transform = `translateX(-90px) scale(0.85) rotateY(15deg)`
                            if (offset === 1) transform = `translateX(90px) scale(0.85) rotateY(-15deg)`
                            if (offset === -2) transform = `translateX(-170px) scale(0.7) rotateY(20deg)`
                            if (offset === 2) transform = `translateX(170px) scale(0.7) rotateY(-20deg)`
                        }

                        const img = item.thumbnail_url || item.media_url || '/connect.png'
                        const link = `/post/${item.slug || item.id}`

                        return (
                            <Link
                                key={item.id}
                                href={link}
                                onMouseEnter={() => !isDragging.current && setActive(i)}
                                style={{ transform, zIndex, opacity, filter } as any}
                                className={`absolute w-[260px] sm:w-[300px] h-[380px] sm:h-[420px] shrink-0 rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? 'ring-2 ring-white/50' : ''}`}
                            >
                                <img src={img} alt={item.titulo} className="absolute inset-0 h-full w-full object-cover pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-white shrink-0" />
                                        <p className="text-sm font-bold text-white leading-tight line-clamp-1">{item.titulo}</p>
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-white/70">Clique para saber mais</p>
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
