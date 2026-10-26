// app/post/[slug]/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatKz(v?: number | null) {
  if (v == null) return null;
  return Number(v).toLocaleString("pt-AO") + " Kz";
}

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

export default function PostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [myReaction, setMyReaction] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; nome: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        let res = await fetch(`${API}/api/v1/posts/slug/${slug}`);
        if (!res.ok) res = await fetch(`${API}/api/v1/posts/${slug}`);
        if (!res.ok) {
          const all = await fetch(`${API}/api/v1/posts?limit=100`).then((r) => r.json());
          const found = all.find((p: any) => p.slug === slug || p.id === slug);
          if (found) {
            setPost(found);
            setLikes(found.likes_count || 0);
            setDislikes(found.dislikes_count || 0);
          } else {
            setLoading(false);
            return;
          }
        } else {
          const data = await res.json();
          setPost(data);
          setLikes(data.likes_count || 0);
          setDislikes(data.dislikes_count || 0);
        }
      } catch {}
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const cid = getClientId();
    fetch(`${API}/api/v1/posts/${post.id}/view`, { method: "POST" }).catch(() => {});
    fetch(`${API}/api/v1/posts/${post.id}/reaction?client_id=${cid}`)
      .then((r) => r.json())
      .then((d) => setMyReaction(d.user_reaction))
      .catch(() => {});
    fetch(`${API}/api/v1/posts/${post.id}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
    fetch(`${API}/api/v1/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
    fetch(`${API}/api/v1/banners?ativo=true`).then((r) => r.json()).then(setBanners).catch(() => {});
    if (post.category_id) {
      fetch(`${API}/api/v1/posts?category_id=${post.category_id}&limit=6`)
        .then((r) => r.json())
        .then((d: any[]) => setRelated(d.filter((p) => p.id !== post.id).slice(0, 4)))
        .catch(() => {});
    }
  }, [post]);

  async function react(type: "like" | "dislike") {
    const client_id = getClientId();
    const res = await fetch(`${API}/api/v1/posts/${post.id}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, client_id }),
    });
    if (res.ok) {
      const d = await res.json();
      setLikes(d.likes_count);
      setDislikes(d.dislikes_count);
      setMyReaction(d.user_reaction);
    }
  }

  async function share() {
    const url = `https://connect-uuo9.onrender.com/post/${post.slug || post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.titulo, url });
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      }
      fetch(`${API}/api/v1/posts/${post.id}/share`, { method: "POST" }).catch(() => {});
    } catch {}
  }

  function handleReply(c: any) {
    setReplyTo({ id: c.id, nome: c.nome });
    setCommentText(`@${c.nome} `);
    inputRef.current?.focus();
    window.scrollTo({ top: inputRef.current?.offsetTop ? inputRef.current.offsetTop - 200 : 0, behavior: "smooth" });
  }

  async function sendComment() {
    if (!commentText.trim()) return;
    const nome = getAnonName();
    const conteudo = replyTo ? `${commentText}` : commentText;

    const res = await fetch(`${API}/api/v1/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, conteudo }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments([c, ...comments]);
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
    if (res.ok) setComments(comments.filter((c) => c.id !== id));
  }

  if (loading) return <div className="min-h-screen grid place-items-center bg-white">Carregando...</div>;
  if (!post) return <div className="min-h-screen grid place-items-center">Post não encontrado</div>;

  const isProduto = ["produto", "product"].includes((post.tipo || "").toLowerCase());
  const cat = categories.find((c: any) => c.id === post.category_id);
  const bannerDentro = banners.find((b: any) => b.posicao === "dentro_post");
  const bannerSidebar = banners.find((b: any) => b.posicao === "sidebar");

  return (
    <main className="min-h-screen bg-[#fcfbf9] text-slate-800">
      <Header />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-24 pb-4">
        <div className="flex items-center gap-2 text-[11px]">
          <Link href="/" className="text-slate-400">Início</Link>
          <span className="text-slate-300">/</span>
          <span className="uppercase font-bold tracking-widest text-sky-700">{cat?.nome || post.tipo}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <article className="col-span-12 lg:col-span-8">
            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
              {(post.thumbnail_url || post.media_url) && (
                <img src={post.thumbnail_url || post.media_url} alt={post.titulo} className="w-full object-cover max-h-130" />
              )}

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="h-px w-7 bg-sky-600" />
                  <span className="font-bold uppercase tracking-widest text-sky-800">{cat?.nome || post.tipo}</span>
                  <span className="ml-auto text-slate-400">{new Date(post.created_at).toLocaleDateString("pt-AO")}</span>
                </div>
                <h1 className="mt-4 text-[28px] sm:text-[36px] font-semibold leading-[1.05] tracking-tight">{post.titulo}</h1>
                {post.descricao && <p className="mt-3 text-[15px] leading-6 text-slate-500">{post.descricao}</p>}
                {isProduto && post.preco && <div className="mt-5 text-2xl font-bold">{formatKz(post.preco_promocional || post.preco)}</div>}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={() => react("like")} className={`h-9 rounded-full border px-4 text-xs font-semibold ${myReaction === "like" ? "bg-black text-white border-black" : "bg-white hover:bg-slate-50"}`}>👍 {likes}</button>
                  <button onClick={() => react("dislike")} className={`h-9 rounded-full border px-4 text-xs font-semibold ${myReaction === "dislike" ? "bg-black text-white" : "bg-white"}`}>👎 {dislikes}</button>
                  <button onClick={share} className="h-9 rounded-full border bg-white px-4 text-xs">↗ Partilhar</button>
                  <span className="ml-auto text-xs text-slate-500 self-center">👁 {post.views || 0} • 💬 {comments.length}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 p-6 sm:p-8">
                <div className="prose max-w-none prose-p:text-[15px] prose-p:leading-7 prose-p:text-slate-600">
                  {post.conteudo ? <div dangerouslySetInnerHTML={{ __html: post.conteudo }} /> : <p>{post.descricao}</p>}
                </div>

                {bannerDentro && (
                  <div className="mt-8 rounded-xl border bg-slate-50 p-3"><a href={bannerDentro.link_url} target="_blank"><img src={bannerDentro.imagem_url} className="w-full rounded-lg" alt=""/></a></div>
                )}

                {/* PROFISSIONAL - COMENTÁRIOS */}
                <div className="mt-12">
                  {/* Input estilo linear */}
                  <div className="flex items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 h-[46px] shadow-sm">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      ref={inputRef as any}
                      placeholder={replyTo ? `Respondendo a ${replyTo.nome}...` : "Comentar ou digite '/' para comandos"}
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendComment())}
                    />
                    <div className="flex items-center gap-1 text-slate-400 text-[12px]">
                      <span className="hidden sm:flex items-center gap-1"><span className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100">@</span><span className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 font-bold">B</span><span className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 italic">I</span></span>
                      <button onClick={sendComment} className="ml-2 h-8 rounded-full bg-black px-4 text-xs font-bold text-white">Enviar</button>
                    </div>
                  </div>

                  {replyTo && (
                    <div className="mt-3 flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-4 py-2 w-fit">
                      Respondendo a <b>{replyTo.nome}</b>
                      <button onClick={() => { setReplyTo(null); setCommentText(""); }} className="ml-2 h-5 w-5 rounded-full bg-black text-white grid place-items-center">×</button>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold tracking-wide">Atividade • {comments.length} comentários</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Você é</span><span className="rounded-full bg-slate-900 text-white px-2.5 py-1 text-[11px] font-bold">{getAnonName()}</span>
                    </div>
                  </div>

                  <div className="relative mt-6">
                    {/* linha */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 hidden sm:block" />

                    <div className="space-y-5">
                      {comments.length === 0 ? (
                        <div className="relative flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 grid place-items-center text-slate-400 text-xs">@</div>
                          <p className="pt-1.5 text-[13px] text-slate-500">Nenhum comentário ainda. Seja o primeiro a comentar.</p>
                        </div>
                      ) : (
                        comments.map((c: any) => (
                          <div key={c.id} className="relative flex gap-3 group">
                            <div className="relative z-10 h-8 w-8 shrink-0 rounded-full bg-white border shadow-sm grid place-items-center">
                              <span className="h-7 w-7 rounded-full bg-slate-900 text-white grid place-items-center text-[10px] font-bold">{initials(c.nome)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[13px] font-semibold text-slate-800">{c.nome}</span>
                                <span className="text-[11px] text-slate-400">• {timeAgo(c.created_at)}</span>
                                {c.conteudo.includes("@") && <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">resposta</span>}
                              </div>

                              <div className="mt-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                {editingId === c.id ? (
                                  <div className="flex flex-col gap-2">
                                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full rounded-lg border p-3 text-sm outline-none focus:border-black" rows={3} />
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => setEditingId(null)} className="h-8 rounded-full border px-4 text-xs">Cancelar</button>
                                      <button onClick={() => updateComment(c.id)} className="h-8 rounded-full bg-black text-white px-4 text-xs font-bold">Salvar</button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[13px] leading-6 text-slate-700 whitespace-pre-wrap break-words">{c.conteudo}</p>
                                )}
                              </div>

                              <div className="mt-2 flex items-center gap-3">
                                <button onClick={() => handleReply(c)} className="text-[12px] text-slate-500 hover:text-black flex items-center gap-1">↪ Responder</button>
                                <button onClick={() => { setEditingId(c.id); setEditText(c.conteudo); }} className="text-[12px] text-slate-400 hover:text-black hidden group-hover:block">Editar</button>
                                <button onClick={() => deleteComment(c.id)} className="text-[12px] text-slate-400 hover:text-red-600 hidden group-hover:block">Apagar</button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-10 flex gap-2">
                    <button onClick={share} className="h-10 rounded-full bg-[#25D366] px-5 text-xs font-bold text-white">WhatsApp</button>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://connect-uuo9.onrender.com/post/${post.slug || post.id}`)}`} target="_blank" className="grid h-10 place-items-center rounded-full bg-[#1877F2] px-5 text-xs font-bold text-white">Facebook</a>
                    <Link href="/" className="grid h-10 place-items-center rounded-full border px-5 text-xs font-bold">Voltar</Link>
                  </div>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest">Relacionados</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((r: any) => (
                    <Link key={r.id} href={`/post/${r.slug || r.id}`} className="flex gap-3 rounded-2xl border bg-white p-3 hover:shadow">
                      <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={r.thumbnail_url || r.media_url} className="h-full w-full object-cover" alt="" /></div>
                      <p className="text-[13px] font-semibold line-clamp-2 leading-snug">{r.titulo}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="col-span-12 lg:col-span-4 space-y-4">
            {bannerSidebar && <div className="rounded-2xl border bg-white p-3"><a href={bannerSidebar.link_url} target="_blank"><img src={bannerSidebar.imagem_url} className="w-full rounded-xl" alt=""/></a></div>}
            <div className="rounded-2xl border bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest">Resumo</p>
              <div className="mt-3 space-y-2 text-xs">
                <p className="flex justify-between"><span className="text-slate-400">Visualizações</span><span className="font-semibold">{post.views || 0}</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Curtidas</span><span className="font-semibold">{likes}</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Comentários</span><span className="font-semibold">{comments.length}</span></p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}
