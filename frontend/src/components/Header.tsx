"use client";
import Link from "next/link";
import { useState } from "react";
import LoginModal from "./Login";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-8">
        <Link href="/" className="flex items-center">
          <img src="/connect.png" alt="CONNECT TICS TECHNOLOGIES" className="h-[36px] sm:h-[40px] w-auto object-contain" />
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
          <button onClick={() => setOpen(!open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </nav>
      {open && (
        <div className="fixed inset-0 z-[80] min-h-dvh bg-[#f8fafc] lg:hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-white/90 backdrop-blur">
            <img src="/connect.png" className="h-8 w-auto" alt="logo"/>
            <button onClick={() => setOpen(false)} className="h-10 w-10 rounded-full border bg-white grid place-items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
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
    <LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} />
    </>
  );
}
