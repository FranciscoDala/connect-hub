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
        } else {
            el.pause()
        }
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
        const onLoadStart = () => setIsLoading(true)
        el.addEventListener('timeupdate', onTime)
        el.addEventListener('loadedmetadata', onTime)
        el.addEventListener('waiting', onWaiting)
        el.addEventListener('canplay', onCanPlay)
        el.addEventListener('playing', onPlaying)
        el.addEventListener('pause', onPause)
        el.addEventListener('loadstart', onLoadStart)
        return () => {
            el.removeEventListener('timeupdate', onTime)
            el.removeEventListener('loadedmetadata', onTime)
            el.removeEventListener('waiting', onWaiting)
            el.removeEventListener('canplay', onCanPlay)
            el.removeEventListener('playing', onPlaying)
            el.removeEventListener('pause', onPause)
            el.removeEventListener('loadstart', onLoadStart)
        }
    }, [src])

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

    if (isAudio) {
        return (
            <div className="relative bg-[#111] rounded-[12px] p-4 border border-white/10 overflow-hidden">
                <div className="relative flex gap-4 items-center">
                    <button onClick={toggle} className="w-12 h-12 rounded-full bg-white text-black grid place-items-center font-black">{playing? '❚❚' : '▶'}</button>
                    <div className="flex-1"><p className="text-white text-[13px] font-bold truncate">{titulo}</p><div onClick={seek} className="h-1.5 bg-white/20 rounded-full mt-2 cursor-pointer"><div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} /></div></div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative rounded-[10px] overflow-hidden bg-black aspect-video w-full group" onMouseMove={() => setShowControls(true)} onMouseLeave={() => playing && setShowControls(false)}>
            <video ref={ref} src={src} poster={poster} onClick={toggle} playsInline preload="metadata" className="w-full h-full object-cover" />
            {isLoading && (
                <div className="absolute inset-0 grid place-items-center bg-black/50 z-20">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="text-[10px] tracking-[0.2em] text-white/70 font-bold">CARREGANDO...</span>
                    </div>
                </div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40 transition-opacity ${showControls? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between"><p className="text-white text-[11px] font-bold truncate pr-4">{titulo}</p><button onClick={() => ref.current?.pause()} className="text-white">✕</button></div>
                <div className="absolute inset-0 grid place-items-center">
                    <button onClick={toggle} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white text-2xl md:text-3xl grid place-items-center hover:scale-105 transition">
                        {playing? '❚❚' : '▶'}
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 mb-2"><span className="text-white text-[10px] font-mono">{fmt(current)}</span><div onClick={seek} className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer"><div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} /></div><span className="text-white/60 text-[10px] font-mono">{fmt(duration)}</span></div>
                    <div className="flex justify-between text-white"><div className="flex gap-2"><button onClick={() => skip(-10)} className="text-[10px] border border-white/30 w-7 h-7 rounded-full">10↺</button><button onClick={() => skip(10)} className="text-[10px] border border-white/30 w-7 h-7 rounded-full">↻10</button></div><div className="flex gap-2 items-center">{onNext && <button onClick={onNext} className="text-[10px] border border-white/30 px-3 py-1 rounded-full">Next ▶▶</button>}<button onClick={() => ref.current?.requestFullscreen()}>⛶</button></div></div>
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
        <section className="bg-[#0a0a0a] rounded-[12px] md:rounded-[16px] overflow-hidden border border-white/10 text-white">
            <div className="relative h-[420px] md:h-[480px] overflow-hidden bg-black">
                <img src={hero.thumbnail_url || hero.media_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                {!isPlaying? (
                    <div className="relative z-10 p-5 md:p-8 h-full flex flex-col justify-end max-w-[58%] md:max-w-[52%]">
                        <div className="flex gap-2 mb-2"><span className="text-[8px] border border-white/30 px-1 py-0.5">PG</span><span className="text-[8px] border border-white/30 px-1 py-0.5">HD</span><span className="text-[10px] text-white/60">2016 • 1h 48m • {hero.tipo?.toUpperCase()}</span></div>
                        <h2 className="text-[22px] md:text-[30px] font-black leading-none mb-2 line-clamp-2">{hero.titulo}</h2>
                        <p className="text-[10px] text-white/60 mb-3 hidden md:block">Police / Cop, Family, Comedy, Animation</p>
                        <button onClick={() => setIsPlaying(true)} className="w-full md:w-[220px] bg-white text-black font-black text-[11px] tracking-widest py-2.5 md:py-3 rounded-[4px] hover:bg-white/90 transition">▶ PLAY</button>
                        <div className="flex gap-5 mt-3">
                            <button className="text-[8px] flex flex-col items-center gap-1 text-white/60"><span className="text-[14px]">+</span>WATCHLIST</button>
                            <button className="text-[8px] flex flex-col items-center gap-1 text-white/60"><span>🎬</span>TRAILER</button>
                        </div>
                        <p className="text-[11px] text-white/70 mt-3 line-clamp-2 leading-relaxed hidden md:block">{hero.descricao || 'A rookie-cop rabbit and wily fox team up to crack a case.'}</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 z-20 bg-black flex items-center justify-center p-0 md:p-2">
                        <div className="w-full h-full md:h-auto md:aspect-video">
                            <ConnectPlayer src={hero.media_url} poster={hero.thumbnail_url} titulo={hero.titulo} tipo={hero.tipo} onNext={() => { setActive((active + 1) % videos.length); setIsPlaying(false) }} />
                        </div>
                        <button onClick={() => setIsPlaying(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white grid place-items-center z-30">✕</button>
                    </div>
                )}
            </div>

            <div className="px-3 md:px-6 flex gap-5 border-b border-white/10">
                {(['SUGGESTED', 'EXTRAS', 'DETAILS'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`py-3 text-[11px] font-bold tracking-[0.15em] border-b-2 transition ${tab === t? 'border-white text-white' : 'border-transparent text-white/40'}`}>{t}</button>
                ))}
            </div>

            <div className="p-1.5 md:p-2 bg-[#0a0a0a]">
                {tab === 'SUGGESTED' && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {videos.map((v: any, i: number) => (
                            <div key={v.id} onClick={() => { setActive(i); setIsPlaying(true) }} className={`group relative aspect-[16/10] rounded-[6px] overflow-hidden cursor-pointer bg-[#111] border ${i === active? 'border-white' : 'border-white/5 hover:border-white/20'}`}>
                                <img src={v.thumbnail_url || v.media_url} className="w-full h-full object-cover" alt="" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                            </div>
                        ))}
                    </div>
                )}
                {tab!== 'SUGGESTED' && <p className="text-[11px] text-white/40 p-3">{tab === 'EXTRAS'? 'Trailers e bastidores em breve.' : `Detalhes: ${hero.titulo} • ${hero.tipo}`}</p>}
            </div>
        </section>
    )
}
