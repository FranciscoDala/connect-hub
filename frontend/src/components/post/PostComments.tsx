// components/post/PostComments.tsx
"use client";
import { useEffect, useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getClientId() {
    if (typeof window === "undefined") return "anon";
    let id = localStorage.getItem("connect_client_id");
    if (!id) {
        id = Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem("connect_client_id", id);
    }
    return id;
}

function getAnonName() {
    const id = getClientId();
    return `Visitante ${id.slice(-4)}`;
}

function initials(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `${m}m atrás`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h atrás`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d atrás`;
    return new Date(date).toLocaleDateString("pt-AO");
}

type Props = {
    postId: string;
    onCountChange?: (n: number) => void;
};

export default function PostComments({ postId, onCountChange }: Props) {
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [replyTo, setReplyTo] = useState<{ id: string; nome: string } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!postId) return;
        fetch(`${API}/api/v1/posts/${postId}/comments`)
            .then((r) => r.json())
            .then((data) => {
                setComments(data);
                onCountChange?.(data.length);
            })
            .catch(() => { });
    }, [postId]);

    function handleReply(c: any) {
        setReplyTo({ id: c.id, nome: c.nome });
        setCommentText(`@${c.nome} `);
        inputRef.current?.focus();
    }

    async function sendComment() {
        if (!commentText.trim()) return;
        const nome = getAnonName();
        const res = await fetch(`${API}/api/v1/posts/${postId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, conteudo: commentText }),
        });
        if (res.ok) {
            const c = await res.json();
            const updated = [c, ...comments];
            setComments(updated);
            onCountChange?.(updated.length);
            setCommentText("");
            setReplyTo(null);
        }
    }

    async function updateComment(id: string) {
        if (!editText.trim()) return;
        const res = await fetch(`${API}/api/v1/comments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conteudo: editText }),
        });
        if (res.ok) {
            const u = await res.json();
            setComments(comments.map((c) => (c.id === id ? u : c)));
            setEditingId(null);
        }
    }

    async function deleteComment(id: string) {
        if (!confirm("Apagar comentário?")) return;
        const res = await fetch(`${API}/api/v1/comments/${id}`, { method: "DELETE" });
        if (res.ok) {
            const updated = comments.filter((c) => c.id !== id);
            setComments(updated);
            onCountChange?.(updated.length);
        }
    }

    return (
        <div className="mt-12">
            <div className="flex h-11 items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-sm">
                <input
                    ref={inputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyTo ? `Respondendo a ${replyTo.nome}...` : "Comentar ou digite '/' para comandos"}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendComment())}
                />
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="hidden items-center gap-1 sm:flex">
                        <span className="grid h-6 w-6 place-items-center rounded hover:bg-slate-100">@</span>
                        <span className="grid h-6 w-6 place-items-center rounded font-bold hover:bg-slate-100">B</span>
                        <span className="grid h-6 w-6 place-items-center rounded italic hover:bg-slate-100">I</span>
                    </span>
                    <button onClick={sendComment} className="ml-2 h-8 rounded-full bg-black px-4 text-xs font-bold text-white">Enviar</button>
                </div>
            </div>

            {replyTo && (
                <div className="mt-3 flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                    Respondendo a <b>{replyTo.nome}</b>
                    <button onClick={() => { setReplyTo(null); setCommentText(""); }} className="ml-2 grid h-5 w-5 place-items-center rounded-full bg-black text-white">×</button>
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide">Atividade • {comments.length} comentários</h3>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">{getAnonName()}</span>
            </div>

            <div className="relative mt-6">
                <div className="absolute bottom-2 left-4 top-2 hidden w-px bg-slate-200 sm:block" />
                <div className="space-y-5">
                    {comments.length === 0 ? (
                        <div className="relative flex gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs text-slate-400">@</div>
                            <p className="pt-1.5 text-sm text-slate-500">Nenhum comentário ainda. Seja o primeiro a comentar.</p>
                        </div>
                    ) : (
                        comments.map((c: any) => (
                            <div key={c.id} className="group relative flex gap-3">
                                <div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-white shadow-sm">
                                    <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials(c.nome)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-800">{c.nome}</span>
                                        <span className="text-xs text-slate-400">• {timeAgo(c.created_at)}</span>
                                        {c.conteudo.includes("@") && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">resposta</span>}
                                    </div>

                                    <div className="mt-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                        {editingId === c.id ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full rounded-lg border p-3 text-sm outline-none focus:border-black" rows={3} />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="h-8 rounded-full border px-4 text-xs">Cancelar</button>
                                                    <button onClick={() => updateComment(c.id)} className="h-8 rounded-full bg-black px-4 text-xs font-bold text-white">Salvar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="wrap-break-word whitespace-pre-wrap text-sm leading-6 text-slate-700">{c.conteudo}</p>
                                        )}
                                    </div>

                                    <div className="mt-2 flex items-center gap-3">
                                        <button onClick={() => handleReply(c)} className="text-xs text-slate-500 hover:text-black">↪ Responder</button>
                                        <button onClick={() => { setEditingId(c.id); setEditText(c.conteudo); }} className="hidden text-xs text-slate-400 hover:text-black group-hover:block">Editar</button>
                                        <button onClick={() => deleteComment(c.id)} className="hidden text-xs text-slate-400 hover:text-red-600 group-hover:block">Apagar</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
