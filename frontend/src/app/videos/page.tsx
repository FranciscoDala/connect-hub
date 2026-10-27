"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VideosPage() {
    const [posts, setPosts] = useState<any[]>([]);
    useEffect(() => {
        fetch(`${API}/api/v1/posts?limit=100`).then(r=>r.json()).then((d:any[])=>{
            setPosts(d.filter((p:any)=> ['video','videos','connect tv'].includes((p.tipo||'').toLowerCase())))
        }).catch(()=>{});
    },[]);
    return (
        <main className="min-h-screen bg-stone-50">
            <Header />
            <div className="mx-auto max-w-7xl px-5 pt-24 pb-20 sm:px-8">
                <div className="flex items-center gap-3"><span className="h-px w-8 bg-sky-600"/><p className="text-xs font-bold uppercase tracking-widest text-sky-800">Connect TV</p></div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-700 sm:text-4xl">Connect TV.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">Vídeos, tutoriais e demonstrações dos nossos produtos em ação.</p>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((item:any)=>(
                        <Link key={item.id} href={`/post/${item.slug||item.id}`} className="overflow-hidden rounded-3xl bg-white shadow">
                            <div className="relative aspect-video bg-black"><img src={item.thumbnail_url||item.media_url||'/connect.png'} className="h-full w-full object-cover" alt=""/><span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90">▶</span></div>
                            <div className="p-5"><h3 className="text-sm font-bold wrap-break-word">{item.titulo}</h3></div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
