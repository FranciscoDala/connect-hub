// components/post/EventoSidebar.tsx
"use client";

function formatDate(d?: string) {
    if (!d) return null;
    try {
        return new Date(d).toLocaleString("pt-AO", {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch { return d; }
}

export default function EventoSidebar({ post }: { post: any }) {
    const isEvento = (post?.tipo || "").toLowerCase() === "evento";
    if (!isEvento) return null;

    const statusRaw = (post.status_evento || post.status || post.estado || post.situacao || "").toString().toLowerCase();
    const isCancelado = ["cancelado", "cancelada", "canceled", "cancelled"].includes(statusRaw);
    const isAdiado = ["adiado", "adiada", "postponed"].includes(statusRaw);
    const isEsgotado = ["esgotado", "esgotada", "soldout", "lotado"].includes(statusRaw);
    const isInativo = isCancelado || isAdiado || isEsgotado;

    // Lógica Sem data: se adiado e sem data_inicio, mostra Sem data
    const dataInicioLabel = (() => {
        if (isAdiado && !post.data_inicio) return "Sem data";
        return formatDate(post.data_inicio) || (isAdiado ? "Sem data" : "—");
    })();

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white-0 shadow-sm-0">
            <div className={`px-4 py-3 flex items-center justify-between border-b ${isInativo ? 'bg-red-50 border-red-100' : 'bg-sky-50 border-sky-100'}`}>
                <span className={`text-[11px] font-bold tracking-widest flex items-center gap-2 ${isInativo ? 'text-red-700' : 'text-sky-800'}`}>
                    {isInativo ? '⚠️' : '📅'} {isCancelado ? 'EVENTO CANCELADO' : isAdiado ? 'EVENTO ADIADO' : isEsgotado ? 'EVENTO ESGOTADO' : 'INFORMAÇÕES DO EVENTO'}
                </span>
                {post.modalidade && !isInativo && (
                    <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        {post.modalidade}
                    </span>
                )}
                {isInativo && (
                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        {statusRaw.toUpperCase()}
                    </span>
                )}
            </div>

            <div className={`p-4 space-y-4 ${isInativo ? 'grayscale-[0.3] opacity-80' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Data início</p><p className="mt-1 text-[13px] font-semibold leading-5 text-slate-800">{dataInicioLabel}</p></div>
                    <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Data fim</p><p className="mt-1 text-[13px] font-semibold leading-5 text-slate-800">{post.data_fim ? formatDate(post.data_fim) : "—"}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Local</p><p className="mt-1 text-[13px] font-semibold text-slate-800">{post.local_evento || "—"}</p></div>
                    <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Cidade</p><p className="mt-1 text-[13px] font-semibold text-slate-800">{post.cidade || "—"}</p></div>
                </div>

                <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Endereço</p><p className="mt-1 text-[13px] font-medium text-slate-600 leading-5">{post.endereco || "—"}</p></div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Capacidade</p><p className="mt-1 text-[13px] font-semibold text-slate-800">{post.capacidade ? `${post.inscritos_count || 0} / ${post.capacidade}` : `${post.inscritos_count || 0} inscritos`}</p></div>
                    <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Organizador</p><p className="mt-1 text-[13px] font-bold text-slate-800">{post.organizador || "CONNECT"}</p></div>
                </div>

                <div className="space-y-2 pt-2">
                    {isInativo ? (
                        <button disabled className="flex w-full items-center justify-center rounded-full bg-slate-300 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 cursor-not-allowed">
                            {isCancelado ? 'Evento Cancelado' : isAdiado ? (post.data_inicio ? 'Adiado - Nova Data' : 'Adiado - Sem data') : 'Esgotado'}
                        </button>
                    ) : (
                        <a href={post.link_inscricao || "#"} target="_blank" className="flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-zinc-800 active:scale-[0.98]">
                            Reservar Convite
                        </a>
                    )}

                    {post.link_mapa && (
                        <a href={post.link_mapa} target="_blank" className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:bg-slate-50">
                            Ver no Mapa
                        </a>
                    )}
                </div>
                {post.cidade && <p className="text-center text-[11px] text-slate-400 pt-1">📍 {post.cidade} • {post.local_evento || "Evento presencial"}</p>}
            </div>
        </div>
    );
}
