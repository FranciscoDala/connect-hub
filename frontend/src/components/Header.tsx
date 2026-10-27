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
                <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
                    <nav className="flex h-14 items-center justify-between py-2.5 sm:h-16">
                        <Link href="/" className="flex items-center">
                            <img src="/connect.png" alt="CONNECT" className="h-9 w-auto object-contain sm:h-10" />
                        </Link>
                        <div className="hidden items-center gap-6 text-sm font-semibold text-[#475569] lg:flex">
                            <Link href="/" className="hover:text-black">INÍCIO</Link>
                            <a href="#destaques" className="hover:text-black">Destaques</a>
                            <a href="#categorias" className="hover:text-black">Tecnologia</a>
                            <a href="#videos" className="hover:text-black">Connect TV</a>
                            <a href="#apps" className="hover:text-black">Apps</a>
                            <button onClick={() => setLoginOpen(true)} className="ml-2 rounded-full bg-[#0e8ac2] px-6 py-2.5 text-sm text-white">Login</button>
                        </div>
                        <div className="flex items-center gap-2 lg:hidden">
                            <button onClick={() => setLoginOpen(true)} className="rounded-full bg-[#0e8ac2] px-4 py-2 text-xs font-bold text-white">Login</button>
                            <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full border bg-white">☰</button>
                        </div>
                    </nav>
                </div>
                {open && (
                    <div className="fixed inset-0 z-80 min-h-dvh bg-[#f8fafc] lg:hidden">
                        <div className="mx-auto flex max-w-7xl items-center justify-between border-b bg-white px-5 py-3 sm:px-8">
                            <img src="/connect.png" className="h-8 w-auto" alt="logo" />
                            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border bg-white">✕</button>
                        </div>
                        <div className="mx-auto w-full max-w-7xl p-5 sm:px-8">
                            <div className="rounded-4xl border bg-white p-6 shadow-sm">
                                <div className="grid divide-y text-sm font-semibold">
                                    <Link href="/" onClick={() => setOpen(false)} className="flex justify-between py-4">Início <span className="text-[#0e8ac2]">→</span></Link>
                                    <a href="#destaques" onClick={() => setOpen(false)} className="flex justify-between py-4">Destaques <span className="text-[#0e8ac2]">→</span></a>
                                    <a href="#categorias" onClick={() => setOpen(false)} className="flex justify-between py-4">Tecnologia <span className="text-[#0e8ac2]">→</span></a>
                                    <a href="#videos" onClick={() => setOpen(false)} className="flex justify-between py-4">Connect TV <span className="text-[#0e8ac2]">→</span></a>
                                    <a href="#apps" onClick={() => setOpen(false)} className="flex justify-between py-4">Apps <span className="text-[#0e8ac2]">→</span></a>
                                    <button onClick={() => { setOpen(false); setLoginOpen(true); }} className="flex w-full justify-between py-4 text-left">Login <span className="text-[#0e8ac2]">→</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>
            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
