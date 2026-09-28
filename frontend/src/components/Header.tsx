"use client";
import { useState } from "react";
import Link from "next/link";

const submenuItems = [
    { label: "Item", href: "#" },
    { label: "Item", href: "#" },
    { label: "Item", href: "#" },
    { label: "Item", href: "#" },
];

function SubMenu({ label, mobile = false }: { label: string; mobile?: boolean }) {
    const [open, setOpen] = useState(false);

    if (mobile) {
        return (
            <div className="w-full">
                <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex justify-between items-center py-3 text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-600"
                >
                    {label}
                    <span className={`text-[8px] transition-transform ${open? "rotate-180" : ""}`}>▼</span>
                </button>
                {open && (
                    <div className="pl-2 pb-3">
                        <div className="relative border-l border-zinc-300 ml-1 pl-6 space-y-4 py-1">
                            {submenuItems.map((item, i) => (
                                <div key={i} className="relative">
                                    <span className="absolute -left-7.25 top-1.25 w-2.5 h-2.5 bg-zinc-900 rounded-full ring-4 ring-white" />
                                    <a href={item.href} className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 hover:text-black">{item.label}</a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button className="hover:text-black cursor-pointer transition flex items-center gap-1.5 py-2">
                {label}
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${open? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
                    <div className="w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl p-5">
                        <div className="relative border-l border-zinc-200 ml-1 pl-6 space-y-4">
                            {submenuItems.map((item, i) => (
                                <div key={i} className="relative group/item">
                                    <span className="absolute -left-7.25 top-1 w-2 h-2 bg-zinc-900 rounded-full ring-4 ring-white group-hover/item:bg-black transition" />
                                    <a href={item.href} className="text-[10px] uppercase tracking-[0.15em] font-medium text-zinc-500 hover:text-black transition">{item.label}</a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 md:pt-5 pointer-events-none">
                <header className="pointer-events-auto max-w-6xl mx-auto flex justify-between items-center bg-white border border-zinc-200 rounded-full px-5 md:px-7 py-2.5 shadow-sm">
                    <div className="flex items-center shrink-0">
                        <Link href="/">
                            <img src="/connect.png" alt="CONNECT" className="h-5 md:h-6 w-auto object-contain" />
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-6 text-[11px] capitalize tracking-[0.12em] font-medium text-zinc-500">
                        <Link href="/" className="hover:text-black transition">Página inicial</Link>
                        <Link href="#" className="hover:text-black transition">Connect-tics</Link>
                        <SubMenu label="Notícias" />
                        <SubMenu label="Serviços" />
                        <Link href="#" className="hover:text-black transition">App</Link>
                        <Link href="#" className="hover:text-black transition">Projectos</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link href="/login" className="hidden md:block px-6 py-2 rounded-full bg-zinc-900 text-white text-[10px] font-bold tracking-widest hover:bg-black transition">
                            LOGIN
                        </Link>
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-8 h-8 rounded-full bg-zinc-900 text-white grid place-items-center">
                            <span className="text-[12px]">{mobileOpen? "✕" : "☰"}</span>
                        </button>
                    </div>
                </header>
            </div>

            <div className="h-20 md:h-24" />

            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6 overflow-y-auto">
                    <nav className="flex flex-col divide-y divide-zinc-100">
                        <Link href="/" className="py-3.5 text-[10px] uppercase tracking-[0.18em] text-zinc-600">PÁGINA INICIAL</Link>
                        <Link href="#" className="py-3.5 text-[10px] uppercase tracking-[0.18em] text-zinc-600">CONNECT-TICS</Link>
                        <SubMenu label="NOTÍCIAS" mobile />
                        <SubMenu label="SERVIÇOS" mobile />
                        <Link href="#" className="py-3.5 text-[10px] uppercase tracking-[0.18em] text-zinc-600">APP</Link>
                        <Link href="#" className="py-3.5 text-[10px] uppercase tracking-[0.18em] text-zinc-600">PROJECTOS</Link>
                        <Link href="/login" className="mt-8 w-full py-3.5 rounded-full bg-zinc-900 text-white text-[11px] font-bold tracking-widest text-center">LOGIN</Link>
                    </nav>
                </div>
            )}
        </>
    );
}
