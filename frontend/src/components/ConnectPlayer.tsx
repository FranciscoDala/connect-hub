"use client"
import { useRef, useState, useEffect } from "react"

export function ConnectPlayer({ src, poster, titulo, tipo, onNext }: { src: string, poster?: string, titulo: string, tipo: string, onNext?: () => void }) {
    const ref = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [current, setCurrent] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const isAudio = tipo === 'audio' || tipo === 'musica' || src.toLowerCase().includes('.mp3')

    const toggle = () => {
        const el = ref.current; if (!el) return
        if (el.paused) {
            setIsLoading(true)
            el.play().catch(() => setIsLoading(false))
        } else { el.pause() }
    }
    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        if (ref.current) ref.current.currentTime = pct * (ref.current.duration || 0)
    }
    const skip = (sec: number) => { if (ref.current) ref.current.currentTime += sec }
    useEffect(() => {
        const el = ref.current; if (!el) return
        const onTime = () => { setCurrent(el.currentTime); setDuration(el.duration || 0); setProgress((el.currentTime / (el.duration || 1)) * 100) }
        const onWaiting = () => setIsLoading(true)
        const onCanPlay = () => setIsLoading(false)
        const onPlaying = () => { setIsLoading(false); setPlaying(true) }
        const onPause = () => setPlaying(false)
        el.addEventListener('timeupdate', onTime); el.addEventListener('loadedmetadata', onTime)
        el.addEventListener('waiting', onWaiting); el.addEventListener('canplay', onCanPlay)
        el.addEventListener('playing', onPlaying); el.addEventListener('pause', onPause)
        return () => {
            el.removeEventListener('timeupdate', onTime); el.removeEventListener('loadedmetadata', onTime)
            el.removeEventListener('waiting', onWaiting); el.removeEventListener('canplay', onCanPlay)
            el.removeEventListener('playing', onPlaying); el.removeEventListener('pause', onPause)
        }
    }, [src])
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

    if (isAudio) {
        return (
            <div className="relative bg-[#0a0a0a] border border-white/10 p-3 flex gap-3 items-center">
                <button onClick={toggle} className="w-11 h-11 bg-[#e50914] text-white grid place-items-center font-black">{playing? '❚❚' : '▶'}</button>
                <div className="flex-1"><p className="text-white text-[12px] font-bold truncate tracking-wide">{titulo}</p><div onClick={seek} className="h-[2px] bg-white/20 mt-2 cursor-pointer"><div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} /></div></div>
            </div>
        )
    }

    return (
        <div className="relative bg-black aspect-video w-full group overflow-hidden" onMouseMove={() => setShowControls(true)} onMouseLeave={() => playing && setShowControls(false)}>
            <video ref={ref} src={src} poster={poster} onClick={toggle} playsInline preload="metadata" className="w-full h-full object-cover" />
            {isLoading && (
                <div className="absolute inset-0 grid place-items-center bg-black/80 z-20">
                    <div className="w-10 h-10 border-[3px] border-white/10 border-t-[#e50914] rounded-full animate-spin" />
                </div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 transition-opacity ${showControls? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-black/40 backdrop-blur-[2px] border-b border-white/5"><p className="text-white text-[11px] font-black tracking-[0.2em]">{titulo.toUpperCase()}</p><button onClick={() => ref.current?.pause()} className="w-7 h-7 bg-white/10 grid place-items-center text-white text-[12px]">✕</button></div>
                <div className="absolute inset-0 grid place-items-center"><button onClick={toggle} className="w-16 h-16 bg-[#e50914] text-white text-2xl grid place-items-center shadow-[0_0_30px_rgba(229,9,20,0.6)]">{playing? '❚❚' : '▶'}</button></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/90 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-2"><span className="text-white text-[10px] font-mono">{fmt(current)}</span><div onClick={seek} className="flex-1 h-[2px] bg-white/20 cursor-pointer"><div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} /></div><span className="text-white/40 text-[10px] font-mono">{fmt(duration)}</span></div>
                    <div className="flex justify-between text-white text-[10px]"><div className="flex gap-2"><button onClick={() => skip(-10)} className="border border-white/20 px-2 py-1">-10</button><button onClick={() => skip(10)} className="border border-white/20 px-2 py-1">+10</button></div><div className="flex gap-2">{onNext && <button onClick={onNext} className="bg-white text-black px-3 py-1 font-black tracking-widest">NEXT</button>}<button onClick={() => ref.current?.requestFullscreen()} className="border border-white/20 px-2">⛶</button></div></div>
                </div>
            </div>
        </div>
    )
}

export function ConnectTVSection({ videos }: { videos: any[] }) {
    const [active, setActive] = useState(0)
    const [tab, setTab] = useState<'SUGGESTED' | 'EXTRAS' | 'DETAILS'>('SUGGESTED')
    const [isPlaying, setIsPlaying] = useState(false)
    if (!videos || videos.length === 0) return null
    const hero = videos[active]

    return (
        <section className="bg-[#050505] border border-white/10 text-white w-full">
            {/* HERO BRABO */}
            <div className="relative h-[460px] md:h-[520px] overflow-hidden bg-black">
                <img src={hero.thumbnail_url || hero.media_url} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e50914]" />

                {!isPlaying? (
                    <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 bg-black border border-white/10 px-2 py-1">
                                <div className="w-2 h-2 bg-[#e50914] rounded-full animate-pulse" />
                                <span className="text-[9px] font-black tracking-[0.3em]">CONNECT TV</span>
                            </div>
                            <div className="flex gap-1"><span className="text-[8px] bg-white text-black px-1.5 py-0.5 font-black">PG</span><span className="text-[8px] bg-[#e50914] text-white px-1.5 py-0.5 font-black">HD</span></div>
                        </div>

                        <div className="max-w-[88%] md:max-w-[48%]">
                            <h2 className="text-[28px] md:text-[44px] font-black leading-[0.9] tracking-[-0.02em] uppercase">{hero.titulo}</h2>
                            <div className="w-12 h-[3px] bg-[#e50914] mt-3 mb-3" />
                            <p className="text-[11px] text-white/50 tracking-widest mb-4">{hero.tipo?.toUpperCase()} • 2024 • ORIGINAL</p>
                            <p className="text-[12px] text-white/70 leading-[1.4] line-clamp-2 hidden md:block border-l-2 border-white/10 pl-3">{hero.descricao}</p>

                            <div className="flex gap-0 mt-5">
                                <button onClick={() => setIsPlaying(true)} className="bg-[#e50914] text-white font-black text-[11px] tracking-[0.2em] px-7 py-3 hover:bg-[#ff0a16] transition shadow-[0_0_20px_rgba(229,9,20,0.4)]">▶ ASSISTIR</button>
                                <button className="bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-[10px] tracking-[0.2em] px-5 py-3 ml-[2px]">+ LISTA</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 z-20 bg-black">
                        <ConnectPlayer src={hero.media_url} poster={hero.thumbnail_url} titulo={hero.titulo} tipo={hero.tipo} onNext={() => { setActive((active + 1) % videos.length); setIsPlaying(false) }} />
                        <button onClick={() => setIsPlaying(false)} className="absolute top-3 right-3 w-8 h-8 bg-[#e50914] text-white grid place-items-center text-[12px] font-black z-30">✕</button>
                    </div>
                )}
            </div>

            {/* TABS QUADRADAS */}
            <div className="flex bg-black border-y border-white/10">
                {(['SUGGESTED', 'EXTRAS', 'DETAILS'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 md:flex-none md:px-8 py-3 text-[10px] font-black tracking-[0.25em] border-b-[2px] transition ${tab === t? 'bg-white text-black border-white' : 'bg-transparent text-white/30 border-transparent hover:text-white/60'}`}>{t}</button>
                ))}
            </div>

            {/* GRID QUADRADO PEQUENO - SEM ARREDONDAMENTO */}
            <div className="bg-[#080808] p-[2px]">
                {tab === 'SUGGESTED' && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-[2px]">
                        {videos.map((v: any, i: number) => (
                            <div key={v.id} onClick={() => { setActive(i); setIsPlaying(false); window.scrollTo({top:0, behavior:'smooth'}) }} className={`group relative aspect-[3/4] md:aspect-[16/10] bg-[#0f0f0f] cursor-pointer overflow-hidden ${i === active? 'ring-[2px] ring-[#e50914] ring-inset' : 'hover:ring-[1px] hover:ring-white/20 ring-inset'}`}>
                                <img src={v.thumbnail_url || v.media_url} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300" alt="" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-transparent opacity-60" />
                                {i === active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#e50914]" />}
                                <div className="absolute top-1 left-1 bg-black/80 border border-white/10 px-1 text-[7px] font-black">0{i+1}</div>
                                <div className="absolute inset-0 hidden group-hover:grid place-items-center bg-black/60"><span className="w-8 h-8 bg-[#e50914] text-white grid place-items-center text-[10px]">▶</span></div>
                            </div>
                        ))}
                    </div>
                )}
                {tab!== 'SUGGESTED' && <p className="text-[11px] text-white/30 p-4 font-mono">{tab === 'EXTRAS'? '> TRAILERS_E_BASTIDORES_EM_BREVE_' : `> DETALHES: ${hero.titulo} // ${hero.tipo}`}</p>}
            </div>
        </section>
    )
}
