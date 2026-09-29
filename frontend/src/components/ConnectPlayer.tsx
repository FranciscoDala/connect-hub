"use client"
import { useRef, useState, useEffect } from "react"

function formatTitle(str: string) {
  if (!str) return ""
  const lower = str.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

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
        if (el.paused) { setIsLoading(true); el.play().catch(() => setIsLoading(false)) } else { el.pause() }
    }
    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        if (ref.current) ref.current.currentTime = pct * (ref.current.duration || 0)
    }
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
        return () => { el.removeEventListener('timeupdate', onTime); el.removeEventListener('loadedmetadata', onTime); el.removeEventListener('waiting', onWaiting); el.removeEventListener('canplay', onCanPlay); el.removeEventListener('playing', onPlaying); el.removeEventListener('pause', onPause) }
    }, [src])
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
    if (isAudio) {
        return (
            <div className="bg-white border border-zinc-200 p-3 flex gap-3 items-center">
                <button onClick={toggle} className="w-11 h-11 bg-[#0a2a5e] text-white grid place-items-center font-bold">{playing? '❚❚' : '▶'}</button>
                <div className="flex-1"><p className="text-zinc-900 text-[13px] font-semibold truncate">{formatTitle(titulo)}</p><div onClick={seek} className="h-[3px] bg-zinc-200 mt-2 cursor-pointer"><div className="h-full bg-[#0a2a5e]" style={{ width: `${progress}%` }} /></div></div>
            </div>
        )
    }
    return (
        <div className="relative bg-black aspect-video w-full group overflow-hidden" onMouseMove={() => setShowControls(true)} onMouseLeave={() => playing && setShowControls(false)}>
            <video ref={ref} src={src} poster={poster} onClick={toggle} playsInline preload="metadata" className="w-full h-full object-cover" />
            {isLoading && <div className="absolute inset-0 grid place-items-center bg-black/70 z-20"><div className="w-9 h-9 border-[3px] border-white/20 border-t-white animate-spin" /></div>}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 transition-opacity ${showControls? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between bg-black/60 border-b border-white/10"><p className="text-white text-[11px] font-medium truncate">{formatTitle(titulo)}</p><button onClick={() => { ref.current?.pause(); setPlaying(false) }} className="w-6 h-6 bg-white/20 grid place-items-center text-white">✕</button></div>
                <div className="absolute inset-0 grid place-items-center"><button onClick={toggle} className="w-14 h-14 bg-[#0a2a5e] text-white text-xl grid place-items-center">{playing? '❚❚' : '▶'}</button></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-200 flex items-center gap-3"><span className="text-zinc-900 text-[11px] font-mono">{fmt(current)}</span><div onClick={seek} className="flex-1 h-[3px] bg-zinc-200 cursor-pointer"><div className="h-full bg-[#0a2a5e]" style={{ width: `${progress}%` }} /></div><span className="text-zinc-500 text-[11px] font-mono">{fmt(duration)}</span>{onNext && <button onClick={onNext} className="bg-zinc-900 text-white px-3 py-1 text-[10px] font-bold tracking-wide">Próximo</button>}</div>
            </div>
        </div>
    )
}

export function ConnectTVSection({ videos }: { videos: any[] }) {
    const [active, setActive] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playerKey, setPlayerKey] = useState(0)
    const [tab, setTab] = useState<'Sugeridos' | 'Extras' | 'Detalhes'>('Sugeridos')
    if (!videos || videos.length === 0) return null
    const hero = videos[active]
    const handleSelect = (i: number) => {
        setActive(i)
        setIsPlaying(true)
        setPlayerKey(k => k + 1)
    }
    return (
        <section className="bg-white border border-zinc-200 w-full">
            <div className="h-[3px] w-full bg-[#0a2a5e]" />
            <div className="relative h-[420px] md:h-[480px] overflow-hidden bg-[#0a2a5e]">
                <img src={hero.thumbnail_url || hero.media_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a2a5e] via-[#0a2a5e]/60 to-transparent" />
                {!isPlaying? (
                    <div className="relative z-10 p-5 md:p-8 h-full flex flex-col justify-end max-w-[90%] md:max-w-[55%]">
                        <div className="inline-flex items-center gap-2 bg-white px-2 py-1 text-[9px] font-bold tracking-widest text-[#0a2a5e] w-fit mb-3"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" /> Connect tv ao vivo</div>
                        <h2 className="text-[26px] md:text-[36px] font-bold leading-[1] text-white">{formatTitle(hero.titulo)}</h2>
                        <div className="w-10 h-[3px] bg-white mt-3 mb-3" />
                        <p className="text-[12px] text-white/80 line-clamp-2 leading-relaxed">{hero.descricao? formatTitle(hero.descricao) : formatTitle(hero.tipo)}</p>
                        <button onClick={(e) => { e.preventDefault(); setIsPlaying(true); setPlayerKey(k=>k+1) }} className="mt-5 bg-white text-[#0a2a5e] font-bold text-[11px] tracking-wide px-6 py-2.5 w-fit hover:bg-zinc-100 transition">▶ Assistir agora</button>
                    </div>
                ) : (
                    <div className="absolute inset-0 z-20 bg-black">
                        <ConnectPlayer key={playerKey} src={hero.media_url} poster={hero.thumbnail_url} titulo={hero.titulo} tipo={hero.tipo} onNext={() => { setActive((a) => (a + 1) % videos.length); setPlayerKey(k=>k+1) }} />
                        <button onClick={() => setIsPlaying(false)} className="absolute top-3 right-3 w-8 h-8 bg-white text-[#0a2a5e] grid place-items-center font-bold z-30">✕</button>
                    </div>
                )}
            </div>
            <div className="flex border-b border-zinc-200 bg-zinc-50">
                {(['Sugeridos','Extras','Detalhes'] as const).map(t=>(
                    <button key={t} onClick={()=>setTab(t)} className={`px-6 py-3 text-[11px] font-semibold tracking-wide border-b-2 capitalize ${tab===t? 'border-[#0a2a5e] text-[#0a2a5e] bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>{t}</button>
                ))}
            </div>
            <div className="p-[2px] bg-zinc-100">
                {tab==='Sugeridos' && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-[2px]">
                        {videos.map((v:any,i:number)=>(
                            <div key={v.id} onClick={()=>handleSelect(i)} className={`relative aspect-[4/3] md:aspect-[16/10] bg-white cursor-pointer overflow-hidden border ${i===active? 'border-[#0a2a5e] ring-1 ring-[#0a2a5e] ring-inset' : 'border-zinc-200 hover:border-zinc-400'}`}>
                                <img src={v.thumbnail_url || v.media_url} className="w-full h-full object-cover" alt="" loading="lazy" />
                                {i===active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0a2a5e]" />}
                                <div className="absolute top-1 left-1 bg-[#0a2a5e] text-white text-[8px] px-1 py-0.5 font-bold">{String(i+1).padStart(2,'0')}</div>
                            </div>
                        ))}
                    </div>
                )}
                {tab!=='Sugeridos' && <p className="p-4 text-[12px] text-zinc-500">{tab==='Extras'? 'Trailers e bastidores em breve.' : `Detalhes: ${formatTitle(hero.titulo)}`}</p>}
            </div>
        </section>
    )
}
