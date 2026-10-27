// components/post/PostSidebar.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PostMini = {
  id: string;
  slug?: string;
  titulo: string;
  descricao?: string;
  thumbnail_url?: string;
  media_url?: string;
  views?: number;
};

type Props = {
  postId: string;
  categoryId?: string;
};

export default function PostSidebar({ postId, categoryId }: Props) {
  const [tab, setTab] = useState<"recentes" | "lidas">("recentes");
  const [recentes, setRecentes] = useState<PostMini[]>([]);
  const [lidas, setLidas] = useState<PostMini[]>([]);

  useEffect(() => {
    fetch(`${API}/api/v1/posts?limit=8`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const filtered = data.filter((p) => p.id !== postId).slice(0, 4);
        setRecentes(filtered);
      })
      .catch(() => {});

    const urlLidas = categoryId
      ? `${API}/api/v1/posts?category_id=${categoryId}&limit=20`
      : `${API}/api/v1/posts?limit=20&order_by=views`;

    fetch(urlLidas)
      .then((r) => r.json())
      .then((data: any[]) => {
        const sorted = [...data]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .filter((p) => p.id !== postId)
          .slice(0, 4);
        setLidas(sorted);
      })
      .catch(() => {});
  }, [postId, categoryId]);

  const list = tab === "recentes" ? recentes : lidas;

  return (
    <aside className="col-span-12 space-y-4 lg:col-span-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-6 border-b border-slate-100 px-5 pt-5">
          <button
            onClick={() => setTab("recentes")}
            className={`relative pb-3 text-xs font-bold uppercase tracking-widest transition ${
              tab === "recentes" ? "text-red-700" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Mais Recentes
            {tab === "recentes" && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-700" />}
          </button>
          <button
            onClick={() => setTab("lidas")}
            className={`relative pb-3 text-xs font-bold uppercase tracking-widest transition ${
              tab === "lidas" ? "text-red-700" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Mais Lidas
            {tab === "lidas" && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-red-700" />}
          </button>
        </div>

        <div className="px-5">
          {list.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">Carregando...</div>
          ) : (
            list.map((p) => (
              <Link
                key={p.id}
                href={`/post/${p.slug || p.id}`}
                className="group flex gap-4 border-b border-slate-100 py-4 last:border-0"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={p.thumbnail_url || p.media_url || "/placeholder.jpg"}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800 group-hover:text-sky-700">
                    {p.titulo}
                  </h4>
                  {p.descricao && (
                    <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
                      {p.descricao}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
