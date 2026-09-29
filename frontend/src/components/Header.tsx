"use client";
import { useState } from "react";
import Link from "next/link";
export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <>
            <div className="w-full bg-[#0a2a5e] text-white text-[10px] py-1.5 px-4 flex justify-between items-center tracking-wide">
                <span>geral@connect.ao • Linha de apoio: 15555</span><span className="hidden md:block">Segunda a sexta • 8h às 17h</span>
            </div>
            <div className="sticky top-0 z-50 bg-white border-b border-zinc-200">
                <header className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-3">
                    <Link href="/"><img src="/connect.png" alt="CONNECT" className="h-6 w-auto" /></Link>
                    <nav className="hidden lg:flex items-center gap-6 text-[11px] font-semibold tracking-wide text-zinc-600">
                        <Link href="/" className="hover:text-[#0a2a5e]">Página inicial</Link>
                        <Link href="#" className="hover:text-[#0a2a5e]">Serviços</Link>
                        <Link href="#" className="hover:text-[#0a2a5e]">Notícias</Link>
                        <Link href="#" className="hover:text-[#0a2a5e]">Projectos</Link>
                    </nav>
                    <div className="flex items-center gap-2"><Link href="/login" className="px-5 py-2 bg-[#0a2a5e] text-white text-[10px] font-bold tracking-widest">Entrar</Link><button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden w-8 h-8 bg-zinc-900 text-white grid place-items-center">{mobileOpen? "✕" : "☰"}</button></div>
                </header>
                {mobileOpen && <div className="lg:hidden border-t border-zinc-200 bg-white p-4 grid gap-3 text-[11px] font-semibold"><Link href="/">Página inicial</Link><Link href="#">Serviços</Link><Link href="#">Notícias</Link></div>}
            </div>
        </>
    );
}
