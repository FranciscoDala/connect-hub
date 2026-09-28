"use client";
import { useState } from "react";

const submenuItems = ["Item", "Item", "Item", "Item"];

function SubMenu({ label }: { label: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <span className="hover:text-black cursor-pointer transition flex items-center gap-1">
                {label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
            </span>

            {open && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50">
                    <div className="w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl p-6">
                        {/* Linha vertical com bolinhas */}
                        <div className="relative border-l border-zinc-300 ml-1 pl-6 space-y-5">
                            {submenuItems.map((item, i) => (
                                <div key={i} className="relative group/item">
                                    <span className="absolute -left-7.25 top-1.25 w-2.5 h-2.5 bg-zinc-900 rounded-full ring-4 ring-white group-hover/item:bg-black transition" />
                                    <a href="#" className="text-[11px] uppercase tracking-widest font-medium text-zinc-600 hover:text-black transition">
                                        {item}
                                    </a>
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
    return (
        <header className="max-w-6xl mx-auto flex justify-between items-center my-6 bg-white border border-zinc-200 rounded-full px-6 py-3 shadow-sm sticky top-6 z-50">
            <div className="flex items-center">
                <img src="/connect.png" alt="CONNECT" className="h-7 w-auto object-contain" />
            </div>
            <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-600">
                <span className="hover:text-black cursor-pointer transition">Página Inical</span>
                <span className="hover:text-black cursor-pointer transition">Connect-Tics</span>
                <SubMenu label="Notícias" />
                <SubMenu label="Serviços" />
                <span className="hover:text-black cursor-pointer transition">App</span>
                <span className="hover:text-black cursor-pointer transition">Projectos</span>
            </nav>
            <button className="px-7 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-widest hover:bg-black transition">
                LOGIN
            </button>
        </header>
    );
}
