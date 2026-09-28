"use client"
import { useRef, useState, useEffect } from "react"

export function ConnectPlayer({ src, poster, titulo, tipo, onNext }: { src: string, poster?: string, titulo: string, tipo: string, onNext?: () => void }) {
    const ref = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [current, setCurrent] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const isAudio = tipo === 'audio' || tipo === 'musica' || src.toLowerCase().includes('.mp3')

    const toggle = () => {
        const el = ref.current; if (!el) return
        if (el.paused) { el.play(); setPlaying(true) } else { el.pause(); setPlaying(false) }
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
        el.addEventListener('timeupdate', onTime)
        el.addEventListener('loadedmetadata', onTime)
        return () => { el.removeEventListener('timeupdate', onTime); el.removeEventListener('loadedmetadata', onTime) }
    }, [])

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

    if (isAudio) {
        return (
            <div className="relative bg-[#111] rounded-[16px] p-4 border border-white/10 overflow-hidden">
                <div className="relative flex gap-4 items-center">
                    <button onClick={toggle} className="w-14 h-14 rounded-full bg-white text-black grid place-items-center font-black">{playing ? '❚❚' : '▶'}</button>
                    <div className="flex-1"><p className="text-white text-[13px] font-bold truncate">{titulo}</p><div onClick={seek} className="h-1.5 bg-white/20 rounded-full mt-2 cursor-pointer"><div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} /></div></div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative rounded-[12px] overflow-hidden bg-black aspect-video group" onMouseMove={() => setShowControls(true)} onMouseLeave={() => playing && setShowControls(false)}>
            <video ref={ref} src={src} poster={poster} onClick={toggle} playsInline preload="metadata" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between"><p className="text-white text-[12px] font-bold">{titulo}</p><button onClick={() => ref.current?.pause()} className="text-white">✕</button></div>
                <div className="absolute inset-0 grid place-items-center"><button onClick={toggle} className="w-20 h-20 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white text-3xl hover:scale-105 transition">{playing ? '❚❚' : '▶'}</button></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-3 mb-3"><span className="text-white text-[11px] font-mono">{fmt(current)}</span><div onClick={seek} className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer"><div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} /></div><span className="text-white/60 text-[11px] font-mono">{fmt(duration)}</span></div>
                    <div className="flex justify-between text-white"><div className="flex gap-3"><button onClick={() => skip(-10)} className="text-[11px] border border-white/30 w-8 h-8 rounded-full">10↺</button><button onClick={() => skip(10)} className="text-[11px] border border-white/30 w-8 h-8 rounded-full">↻10</button><span>🔊</span></div><div className="flex gap-3 items-center"><span className="text-[10px] border px-2 py-0.5 rounded">CC</span>{onNext && <button onClick={onNext} className="text-[10px] border border-white/30 px-3 py-1 rounded-full">Next ▶▶</button>}<span>⚙</span><button onClick={() => ref.current?.requestFullscreen()}>⛶</button></div></div>
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
        <section className="bg-[#0a0a0a] rounded-[24px] overflow-hidden border border-white/10 text-white">
            <div className="relative h-[440px] md:h-[480px] overflow-hidden">
                <img src={hero.thumbnail_url || hero.media_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end max-w-[52%]">
                    <div className="flex gap-2 mb-3"><span className="text-[9px] border border-white/30 px-1.5 py-0.5">PG</span><span className="text-[9px] border border-white/30 px-1.5 py-0.5">HD</span><span className="text-[10px] text-white/60">2016 • 1h 48m • {hero.tipo?.toUpperCase()}</span></div>
                    <h2 className="text-[26px] md:text-[32px] font-black leading-none mb-1 line-clamp-2">{hero.titulo}</h2>
                    <p className="text-[11px] text-white/60 mb-4">Police / Cop, Family, Comedy, Animation</p>
                    {!isPlaying ? (
                        <>
                            <button onClick={() => setIsPlaying(true)} className="w-full md:w-[240px] bg-white text-black font-black text-[12px] tracking-widest py-3 rounded-[4px] hover:bg-white/90 transition">▶ PLAY</button>
                            <div className="flex gap-6 mt-4"><button className="text-[9px] flex flex-col items-center gap-1 text-white/60"><span className="text-[16px]">+</span>WATCHLIST</button><button className="text-[9px] flex flex-col items-center gap-1 text-white/60"><span>🎬</span>TRAILER</button><button className="text-[9px] flex flex-col items-center gap-1 text-white/60"><span>⬇</span>DOWNLOAD</button></div>
                            <p className="text-[12px] text-white/70 mt-4 line-clamp-2 leading-relaxed">{hero.descricao || 'A rookie-cop rabbit and wily fox team up to crack a case.'}</p>
                        </>
                    ) : (
                        <div className="w-full md:w-[500px]"><ConnectPlayer src={hero.media_url} poster={hero.thumbnail_url} titulo={hero.titulo} tipo={hero.tipo} onNext={() => { setActive((active + 1) % videos.length); setIsPlaying(false) }} /></div>
                    )}
                </div>
            </div>
            <div className="px-6 md:px-10 flex gap-6 border-b border-white/10">
                {(['SUGGESTED', 'EXTRAS', 'DETAILS'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`py-4 text-[11px] font-bold tracking-[0.2em] border-b-2 transition ${tab === t ? 'border-white text-white' : 'border-transparent text-white/40'}`}>{t}</button>
                ))}
            </div>
            <div className="p-3 md:p-5">
                {tab === 'SUGGESTED' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {videos.map((v: any, i: number) => (
                            <div key={v.id} onClick={() => { setActive(i); setIsPlaying(true) }} className={`group relative aspect-[16/9] rounded-[8px] overflow-hidden cursor-pointer border-2 ${i === active ? 'border-white' : 'border-transparent hover:border-white/30'}`}>
                                <img src={v.thumbnail_url || v.media_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <p className="absolute bottom-1 left-2 right-2 text-[10px] font-bold line-clamp-1 opacity-0 group-hover:opacity-100 transition">{v.titulo}</p>
                            </div>
                        ))}
                    </div>
                )}
                {tab !== 'SUGGESTED' && <p className="text-[12px] text-white/40 p-4">{tab === 'EXTRAS' ? 'Trailers e bastidores em breve.' : `Detalhes: ${hero.titulo} • ${hero.tipo}`}</p>}
            </div>
        </section>
    )
}
