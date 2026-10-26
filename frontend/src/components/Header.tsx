"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex flex-col items-center text-center leading-none">
          <span className="text-[22px] sm:text-[26px] font-bold tracking-wide text-[#0e8ac2]" style={{ fontFamily: "var(--font-montserrat)" }}>CONNECT</span>
          <span className="mt-[2px] text-[9px] font-bold tracking-[0.22em] text-[#64748b] uppercase">TICS TECHNOLOGIES</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-[#475569]">
          <a href="#destaques" className="hover:text-black transition">Destaques</a>
          <a href="#categorias" className="hover:text-black transition">Tecnologia</a>
          <a href="#categorias" className="hover:text-black transition">Produtos</a>
          <a href="#videos" className="hover:text-black transition">Connect TV</a>
          <a href="#apps" className="hover:text-black transition">Apps</a>
          <Link href="/posts" className="ml-2 rounded-full bg-[#0e8ac2] px-5 py-2.5 text-white shadow-[0_8px_20px_rgba(14,138,194,0.25)] hover:bg-[#0c709e]">Partner</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e2e8f0] bg-white shadow-sm">
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[80] min-h-dvh bg-[#f8fafc] lg:hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-white/90 backdrop-blur">
            <span className="font-bold text-[#0e8ac2]">CONNECT TICS</span>
            <button onClick={() => setOpen(false)} className="h-11 w-11 rounded-full border bg-white">✕</button>
          </div>
          <div className="mx-auto w-full max-w-md flex-1 px-5 py-8">
            <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <p className="mb-3 text-[11px] font-bold tracking-widest text-[#94a3b8]">MENU</p>
              <div className="grid divide-y">
                {["Home","Destaques","Tecnologia","Connect TV","Apps","Contact"].map(l => (
                  <a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setOpen(false)} className="py-4 font-semibold flex justify-between">{l} <span className="text-[#0e8ac2]">→</span></a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
