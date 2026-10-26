"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Connect-TICS" className="h-9 w-9 object-contain rounded-full bg-white border shadow-sm" onError={(e)=>{ (e.target as any).style.display='none' }} />
          <div className="flex flex-col leading-none">
            <span className="text-[20px] sm:text-[22px] font-bold tracking-wide text-[#0e8ac2]" style={{ fontFamily: "var(--font-montserrat)" }}>CONNECT</span>
            <span className="text-[8px] font-bold tracking-[0.22em] text-[#64748b] uppercase -mt-[1px]">TICS TECHNOLOGIES</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-[#475569]">
          <a href="#destaques" className="hover:text-black">Destaques</a>
          <a href="#categorias" className="hover:text-black">Tecnologia</a>
          <a href="#videos" className="hover:text-black">Connect TV</a>
          <a href="#apps" className="hover:text-black">Apps</a>
          <button onClick={()=>setLoginOpen(true)} className="ml-2 rounded-full bg-[#0e8ac2] px-6 py-2.5 text-white text-[13px] shadow-[0_8px_20px_rgba(14,138,194,0.25)] hover:bg-[#0c709e]">Login</button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button onClick={()=>setLoginOpen(true)} className="rounded-full bg-[#0e8ac2] px-4 py-2 text-white text-[12px] font-bold">Login</button>
          <button onClick={() => setOpen(!open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white">{open ? "✕" : "☰"}</button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[80] min-h-dvh bg-[#f8fafc] lg:hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-white/90 backdrop-blur">
            <div className="flex items-center gap-2"><img src="/logo.png" className="h-8 w-8" alt="logo"/><span className="font-bold text-[#0e8ac2]">CONNECT</span></div>
            <button onClick={() => setOpen(false)} className="h-10 w-10 rounded-full border bg-white">✕</button>
          </div>
          <div className="mx-auto w-full max-w-md flex-1 px-5 py-8">
            <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <div className="grid divide-y text-[15px] font-semibold">
                <a href="#destaques" onClick={()=>setOpen(false)} className="py-4 flex justify-between">Destaques <span className="text-[#0e8ac2]">→</span></a>
                <a href="#categorias" onClick={()=>setOpen(false)} className="py-4 flex justify-between">Tecnologia <span className="text-[#0e8ac2]">→</span></a>
                <button onClick={()=>{setOpen(false); setLoginOpen(true)}} className="py-4 flex justify-between w-full text-left">Login <span className="text-[#0e8ac2]">→</span></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>

    {/* MODAL LOGIN - estilo Medicore */}
    {loginOpen && (
      <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
        <div className="absolute inset-0 bg-[#0f172a]/30 backdrop-blur-sm" onClick={()=>setLoginOpen(false)} />
        <div className="relative w-full sm:max-w-[420px] rounded-t-[32px] sm:rounded-[32px] bg-white border shadow-2xl p-7 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="section-kicker">Acesso</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Entrar na Connect</h2>
            </div>
            <button onClick={()=>setLoginOpen(false)} className="h-10 w-10 rounded-full border bg-[#f8fafc]">✕</button>
          </div>
          <form className="grid gap-4" onSubmit={(e)=>{e.preventDefault(); setLoginOpen(false)}}>
            <div>
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748b]">Email</label>
              <input type="email" required placeholder="seu@email.com" className="mt-1.5 w-full rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-5 py-3 text-[14px] focus:border-[#0e8ac2] outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748b]">Senha</label>
              <input type="password" required placeholder="••••••••" className="mt-1.5 w-full rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-5 py-3 text-[14px] focus:border-[#0e8ac2] outline-none" />
            </div>
            <button className="mt-2 rounded-full bg-[#0e8ac2] py-3.5 text-white font-semibold shadow-[0_8px_20px_rgba(14,138,194,0.25)] hover:bg-[#0c709e]">Entrar</button>
            <p className="text-center text-[11px] text-[#94a3b8] mt-2">Esqueceu a senha? Fale com o admin da Connect-TICS</p>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
