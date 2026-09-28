"use client"
import { useRef, useState } from "react"

export function ConnectPlayer({ src, poster, titulo, tipo }: { src: string, poster?: string, titulo: string, tipo: string }) {
    const ref = useRef<HTMLVideoElement | HTMLAudioElement>(null)
    const [playing, setPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const isAudio = tipo === 'audio' || tipo === 'musica' || src.includes('.mp3') || src.includes('.m4a')

    const toggle = () => {
        const el = ref.current
        if (!el) return
        if (el.paused) { el.play(); setPlaying(true) } else { el.pause(); setPlaying(false) }
    }
    const onTime = () => {
        const el = ref.current as any
        if (el?.duration) setProgress((el.currentTime / el.duration) * 100)
    }

    if (isAudio) {
        return (
            <div className="relative bg-zinc-900 rounded-[20px] p-4 border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-blue-600/30" />
                <div className="relative flex gap-4 items-center">
                    <button onClick={toggle} className="w-14 h-14 rounded-full bg-white text-black grid place-items-center font-black shrink-0 hover:scale-105 transition shadow-xl">
                        {playing? '❚❚' : '▶'}
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px] font-bold truncate">{titulo}</p>
                        <div className="h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-[10px] text-white/60 mt-1 tracking-widest">CONNECT AUDIO • {tipo.toUpperCase()}</p>
                    </div>
                </div>
                <audio ref={ref as any} src={src} onTimeUpdate={onTime} onEnded={() => setPlaying(false)} />
            </div>
        )
    }

    return (
        <div className="relative rounded-[16px] overflow-hidden bg-black border border-zinc-800 aspect-video group/video">
            <video ref={ref as any} src={src} poster={poster} onTimeUpdate={onTime} onClick={toggle} playsInline preload="metadata" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 ${playing? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100'}`}>
                <div className="absolute inset-0 grid place-items-center">
                    <button onClick={toggle} className="w-16 h-16 rounded-full bg-white text-black grid place-items-center font-black text-[20px] shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition">
                        {playing? '❚❚' : '▶'}
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-[11px] font-bold line-clamp-1 mb-2">{titulo}</p>
                    <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[9px] text-white/70 font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 border border-white/10">CONNECT TV</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
