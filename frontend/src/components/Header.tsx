"use client";
import { useState } from "react";

const submenuItems = ["Item", "Item", "Item", "Item"];

function SubMenu({ label, mobile = false }: { label: string; mobile?: boolean }) {
    const [open, setOpen] = useState(false);

    if (mobile) {
        return (
            <div className="w-full">
                <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-3 text-xs uppercase tracking-widest font-medium">
                    {label}
                    <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
                </button>
                {open && (
                    <div className="pl-2 py-2">
                        <div className="relative border-l border-zinc-300 ml-1 pl-6 space-y-4 py-1">
                            {submenuItems.map((item, i) => (
                                <div key={i} className="relative">
                                    <span className="absolute -left-7.25 top-1.25 w-2.5 h-2.5 bg-zinc-900 rounded-full ring-4 ring-white" />
                                    <a href="#" className="text-xs uppercase tracking-widest text-zinc-600 hover:text-black">{item}</a>
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
            <span className="hover:text-black cursor-pointer transition flex items-center gap-1">
                {label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
            </span>
            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50">
                    <div className="w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl p-6">
                        <div className="relative border-l border-zinc-300 ml-1 pl-6 space-y-5">
                            {submenuItems.map((item, i) => (
                                <div key={i} className="relative group/item">
                                    <span className="absolute -left-7.25 top-1.25 w-2.5 h-2.5 bg-zinc-900 rounded-full ring-4 ring-white group-hover/item:bg-black transition" />
                                    <a href="#" className="text-2.75 uppercase tracking-widest font-medium text-zinc-600 hover:text-black transition">{item}</a>
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
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <header className="max-w-6xl mx-auto flex justify-between items-center mt-4 md:mt-6 bg-white border border-zinc-200 rounded-full px-4 md:px-6 py-3 shadow-sm sticky top-4 md:top-6 z-50">
                    <div className="flex items-center">
                        <img src="/connect.png" alt="CONNECT" className="h-6 md:h-7 w-auto object-contain" />
                    </div>

                    <nav className="hidden lg:flex items-center gap-6 text-2.75 uppercase tracking-widest text-zinc-600">
                        <span className="hover:text-black cursor-pointer transition">Página Inicial</span>
                        <span className="hover:text-black cursor-pointer transition">Connect-Tics</span>
                        <SubMenu label="Notícias" />
                        <SubMenu label="Serviços" />
                        <span className="hover:text-black cursor-pointer transition">App</span>
                        <span className="hover:text-black cursor-pointer transition">Projectos</span>
                    </nav>

                    <div className="flex items-center gap-2">
                        <button className="hidden md:block px-7 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-widest hover:bg-black transition">LOGIN</button>
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-9 h-9 rounded-full bg-zinc-900 text-white grid place-items-center">
                            <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
                        </button>
                    </div>
                </header>
            </div>

            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6">
                    <nav className="flex flex-col text-sm font-medium divide-y divide-zinc-100">
                        <span className="py-3 uppercase tracking-widest text-xs">Página Inicial</span>
                        <span className="py-3 uppercase tracking-widest text-xs">Connect-Tics</span>
                        <SubMenu label="Notícias" mobile />
                        <SubMenu label="Serviços" mobile />
                        <span className="py-3 uppercase tracking-widest text-xs">App</span>
                        <span className="py-3 uppercase tracking-widest text-xs">Projectos</span>
                        <button className="mt-6 w-full py-3 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-widest">LOGIN</button>
                    </nav>
                </div>
            )}
        </>
    );
}
