// app/post/[slug]/page.tsx
"use client";
import { useEffect, useState } from "react";
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
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("connect_client_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("connect_client_id", id);
  }
  return id;
}
function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h atrás`;
  const day = Math.floor(h/24);
  return `${day}d atrás`;
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
  const [commentNome, setCommentNome] = useState("");
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        let res = await fetch(`${API}/api/v1/posts/slug/${slug}`);
        if (!res.ok) res = await fetch(`${API}/api/v1/posts/${slug}`);
        if (!res.ok) {
          const all = await fetch(`${API}/api/v1/posts?limit=100`).then(r=>r.json());
          const found = all.find((p:any)=>p.slug===slug||p.id===slug);
          if (found) { setPost(found); setLikes(found.likes_count||0); setDislikes(found.dislikes_count||0);} else { setLoading(false); return; }
        } else {
          const data = await res.json();
          setPost(data); setLikes(data.likes_count||0); setDislikes(data.dislikes_count||0);
        }
      } catch {}
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const cid = getClientId();
    fetch(`${API}/api/v1/posts/${post.id}/view`, {method:"POST"}).catch(()=>{});
    fetch(`${API}/api/v1/posts/${post.id}/reaction?client_id=${cid}`).then(r=>r.json()).then(d=>setMyReaction(d.user_reaction)).catch(()=>{});
    fetch(`${API}/api/v1/posts/${post.id}/comments`).then(r=>r.json()).then(setComments).catch(()=>{});
    fetch(`${API}/api/v1/categories`).then(r=>r.json()).then(setCategories).catch(()=>{});
    fetch(`${API}/api/v1/banners?ativo=true`).then(r=>r.json()).then(setBanners).catch(()=>{});
    if (post.category_id) {
      fetch(`${API}/api/v1/posts?category_id=${post.category_id}&limit=6`).then(r=>r.json()).then((d:any[])=>setRelated(d.filter(p=>p.id!==post.id).slice(0,4))).catch(()=>{});
    }
  }, [post]);

  async function react(type:'like'|'dislike'){
    const client_id=getClientId();
    const res=await fetch(`${API}/api/v1/posts/${post.id}/reaction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,client_id})});
    if(res.ok){const d=await res.json(); setLikes(d.likes_count); setDislikes(d.dislikes_count); setMyReaction(d.user_reaction);}
  }
  async function share(){
    const url=`https://connect-uuo9.onrender.com/post/${post.slug||post.id}`;
    try{
      if(navigator.share){await navigator.share({title:post.titulo,url});}
      else{await navigator.clipboard.writeText(url); alert("Link copiado!");}
      fetch(`${API}/api/v1/posts/${post.id}/share`,{method:"POST"}).catch(()=>{});
    }catch{}
  }
  async function sendComment(){
    if(!commentText.trim()) return;
    const res=await fetch(`${API}/api/v1/posts/${post.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nome:commentNome||"Anónimo",conteudo:commentText})});
    if(res.ok){const c=await res.json(); setComments([c,...comments]); setCommentText("");}
  }
  async function updateComment(id:string){
    if(!editText.trim()) return;
    const res=await fetch(`${API}/api/v1/comments/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({conteudo:editText})});
    if(res.ok){const u=await res.json(); setComments(comments.map(c=>c.id===id?u:c)); setEditingId(null);}
  }
  async function deleteComment(id:string){
    if(!confirm("Apagar?")) return;
    const res=await fetch(`${API}/api/v1/comments/${id}`,{method:"DELETE"});
    if(res.ok) setComments(comments.filter(c=>c.id!==id));
  }

  if(loading) return <div className="min-h-screen grid place-items-center bg-[#f7f7f7]">Carregando...</div>;
  if(!post) return <div className="min-h-screen grid place-items-center">Post não encontrado</div>;

  const isProduto=['produto','product'].includes((post.tipo||'').toLowerCase());
  const cat=categories.find((c:any)=>c.id===post.category_id);
  const bannerDentro=banners.find((b:any)=>b.posicao==='dentro_post');
  const bannerSidebar=banners.find((b:any)=>b.posicao==='sidebar');

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-slate-800">
      <Header />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-24 pb-4">
        <div className="flex items-center gap-2 text-[11px] font-medium"><Link href="/" className="text-slate-400">Início</Link><span className="text-slate-300">/</span><span className="uppercase tracking-widest font-bold text-sky-700">{cat?.nome||post.tipo}</span></div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <article className="col-span-12 lg:col-span-8">
            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {(post.thumbnail_url||post.media_url) && (
                <div className="bg-slate-100"><img src={post.thumbnail_url||post.media_url} alt={post.titulo} className="w-full object-cover max-h-130" /></div>
              )}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2"><span className="h-px w-7 bg-sky-600"/><span className="text-[11px] font-bold uppercase tracking-widest text-sky-800">{cat?.nome||post.tipo}</span><span className="ml-auto text-[11px] text-slate-400">{new Date(post.created_at).toLocaleDateString('pt-AO')}</span></div>
                <h1 className="mt-4 text-[28px] sm:text-[38px] font-semibold tracking-tight leading-[1.05]">{post.titulo}</h1>
                {post.descricao && <p className="mt-3 text-[15px] text-slate-500 leading-6">{post.descricao}</p>}
                {isProduto && post.preco && <div className="mt-5 text-2xl font-bold">{formatKz(post.preco_promocional||post.preco)}</div>}
                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={()=>react('like')} className={`h-9 rounded-full border px-4 text-xs font-semibold ${myReaction==='like'?'bg-black text-white':'bg-white hover:bg-slate-50'}`}>👍 {likes}</button>
                  <button onClick={()=>react('dislike')} className={`h-9 rounded-full border px-4 text-xs font-semibold ${myReaction==='dislike'?'bg-slate-900 text-white':'bg-white'}`}>👎 {dislikes}</button>
                  <button onClick={share} className="h-9 rounded-full border bg-white px-4 text-xs">↗ Partilhar</button>
                </div>
              </div>

              <div className="border-t border-slate-100 p-6 sm:p-8">
                <div className="prose max-w-none prose-p:text-[15px] prose-p:leading-7 prose-p:text-slate-600">
                  {post.conteudo ? <div dangerouslySetInnerHTML={{__html:post.conteudo}}/> : <p>{post.descricao}</p>}
                </div>

                {bannerDentro && <div className="mt-8 rounded-xl border p-3 bg-slate-50"><a href={bannerDentro.link_url} target="_blank"><img src={bannerDentro.imagem_url} className="w-full rounded-lg"/></a></div>}

                {/* ===== ACTIVITY LOG - PROFESSIONAL ===== */}
                <div className="mt-12">
                  {/* Comment input bar like screenshot */}
                  <div className="relative flex items-center rounded-full border border-slate-200 bg-white px-4 h-11 shadow-sm focus-within:ring-2 focus-within:ring-black/5">
                    <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Comment or type '/' for commands" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"/>
                    <div className="flex items-center gap-2 ml-3 text-slate-400">
                      <button className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 text-xs">@</button>
                      <button className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 font-bold text-xs">B</button>
                      <button className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 italic text-xs">I</button>
                      <button className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 underline text-xs">U</button>
                      <span className="text-[14px]">...</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold">Activity Log</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Show all activity</span>
                      <button onClick={()=>setShowAll(!showAll)} className={`relative h-5 w-9 rounded-full transition ${showAll?'bg-black':'bg-slate-200'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${showAll?'left-4':'left-0.5'}`}/></button>
                      <button className="h-6 w-6 grid place-items-center rounded-full border text-slate-400">☰</button>
                    </div>
                  </div>

                  {/* TIMELINE */}
                  <div className="relative mt-6">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200"/>

                    <div className="space-y-5">
                      {/* Creator row */}
                      <div className="relative flex gap-3">
                        <div className="relative z-10 h-8 w-8 shrink-0 rounded-full bg-amber-100 text-amber-800 grid place-items-center text-[10px] font-bold border">✦</div>
                        <div className="flex flex-wrap gap-1.5 text-[12px] pt-1.5">
                          <span className="font-semibold">Sonny</span><span className="text-slate-500">created this 2 years ago</span><span className="text-slate-300">•</span><span className="text-slate-500">Lara last edited this on yesterday</span><span className="text-slate-300">•</span><span className="font-semibold">130</span><span className="text-slate-500">Page views</span>
                        </div>
                      </div>

                      {/* Comments */}
                      {comments.map((c:any)=>(
                        <div key={c.id} className="relative flex gap-3 group">
                          <div className="relative z-10 h-8 w-8 shrink-0 rounded-full bg-sky-50 border border-sky-100 grid place-items-center">
                            <span className="h-7 w-7 rounded-full bg-slate-900 text-white grid place-items-center text-[11px] font-bold">{initials(c.nome)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[12px]">
                              <span className="font-semibold text-slate-800">{c.nome}</span>
                              <span className="text-slate-400">• {timeAgo(c.created_at)}</span>
                              <div className="ml-auto hidden group-hover:flex gap-2">
                                <button onClick={()=>{setEditingId(c.id); setEditText(c.conteudo)}} className="text-slate-400 hover:text-black">↩</button>
                                <button onClick={()=>deleteComment(c.id)} className="text-slate-400 hover:text-red-600">×</button>
                              </div>
                            </div>
                            <div className="mt-2 rounded-[12px] border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                              {editingId===c.id ? (
                                <div className="flex flex-col gap-2">
                                  <textarea value={editText} onChange={e=>setEditText(e.target.value)} className="w-full rounded-lg border p-3 text-sm outline-none focus:border-black"/>
                                  <div className="flex gap-2 justify-end"><button onClick={()=>setEditingId(null)} className="h-8 rounded-full border px-4 text-xs">Cancelar</button><button onClick={()=>updateComment(c.id)} className="h-8 rounded-full bg-black px-4 text-xs text-white font-bold">Salvar</button></div>
                                </div>
                              ) : (
                                <p className="text-[13px] leading-6 text-slate-700 whitespace-pre-wrap break-words">{c.conteudo}</p>
                              )}
                            </div>
                            <button className="mt-2 text-[12px] text-slate-500 hover:text-black flex items-center gap-1">↪ Reply</button>
                          </div>
                        </div>
                      ))}

                      {comments.length===0 && (
                        <div className="relative flex gap-3">
                          <div className="relative z-10 h-8 w-8 shrink-0 rounded-full bg-slate-100 grid place-items-center text-slate-400">@</div>
                          <div className="pt-1 text-[12px] text-slate-500">Add to this activity by commenting above • Nenhum comentário ainda.</div>
                        </div>
                      )}

                      {/* System rows example */}
                      <div className="relative flex gap-3 opacity-70">
                        <div className="relative z-10 h-7 w-7 shrink-0 rounded-full bg-slate-100 grid place-items-center text-[10px]">↗</div>
                        <div className="text-[12px] pt-1"><span className="text-slate-600">Gained by</span> <b>Olivia Emmanuel</b> <span className="text-slate-500">via automatic rule</span> <b>On pull request review</b> <span className="text-slate-400">• 8 days ago</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom input for name + comment */}
                  <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex gap-2">
                      <input value={commentNome} onChange={e=>setCommentNome(e.target.value)} placeholder="Nome (opcional)" className="h-10 w-[140px] sm:w-48 rounded-full border border-slate-200 bg-[#fafafa] px-4 text-xs outline-none focus:bg-white focus:border-black"/>
                      <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendComment()} placeholder="Escreve um comentário..." className="h-10 flex-1 rounded-full border border-slate-200 bg-[#fafafa] px-4 text-sm outline-none focus:bg-white focus:border-black"/>
                      <button onClick={sendComment} className="h-10 rounded-full bg-black px-6 text-xs font-bold text-white hover:bg-slate-900">Comentar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {related.length>0 && (
              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest">Relacionados</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((r:any)=><Link key={r.id} href={`/post/${r.slug||r.id}`} className="flex gap-3 rounded-2xl border bg-white p-3 hover:shadow"><div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden"><img src={r.thumbnail_url||r.media_url} className="h-full w-full object-cover"/></div><p className="text-[13px] font-semibold line-clamp-2">{r.titulo}</p></Link>)}
                </div>
              </div>
            )}
          </article>

          <aside className="col-span-12 lg:col-span-4 space-y-4">
            {bannerSidebar && <div className="rounded-2xl border bg-white p-3"><a href={bannerSidebar.link_url} target="_blank"><img src={bannerSidebar.imagem_url} className="w-full rounded-xl"/></a></div>}
            <div className="rounded-2xl border bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-widest">Stats</p><div className="mt-3 space-y-2 text-xs"><p className="flex justify-between"><span className="text-slate-400">Views</span><span className="font-semibold">{post.views||0}</span></p><p className="flex justify-between"><span className="text-slate-400">Likes</span><span className="font-semibold">{likes}</span></p><p className="flex justify-between"><span className="text-slate-400">Comments</span><span className="font-semibold">{comments.length}</span></p></div></div>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}
