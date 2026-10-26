"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(id);
    }, []);

    const timeZone = "Africa/Luanda";
    const timeString = now ? new Intl.DateTimeFormat("pt-AO", { hour: "2-digit", minute: "2-digit", timeZone, timeZoneName: "short" }).format(now) : "--:--";
    const dateString = now ? new Intl.DateTimeFormat("pt-AO", { day: "2-digit", month: "long", year: "numeric", timeZone }).format(now) : "Carregando...";
    const weekDayString = now ? new Intl.DateTimeFormat("pt-AO", { weekday: "long", timeZone }).format(now) : "";
    const isWeekend = now ? [0, 6].includes(now.getDay()) : false;
    const hourLuanda = now ? parseInt(new Intl.DateTimeFormat("pt-AO", { hour: "2-digit", hour12: false, timeZone }).format(now)) : 0;
    const isOpen = !isWeekend && hourLuanda >= 9 && hourLuanda < 17;
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-[#e2e8f0] bg-[#f1f5f9]">
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
                <div className="mb-12 h-px w-full bg-[#e2e8f0]" />

                <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <Link href="/" className="flex items-center">
                            <img src="/connect.png" alt="CONNECT" className="h-20 w-auto object-contain" />
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#64748b]">Inovamos para liderar</p>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#64748b]">Tecnologia é a aplicação prática do conhecimento científico para resolver problemas, criar ferramentas e facilitar as tarefas diárias.</p>
                        <p className="mt-4 flex items-center gap-2 text-xs text-[#64748b]">
                            <span className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-zinc-400'}`} />
                            {isOpen ? 'Aberto agora' : 'Fechado'} • {timeString}
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="text-sm font-bold tracking-widest text-[#334155]">EXPLORE</h4>
                        <ul className="mt-4 grid gap-2.5 text-sm text-[#64748b]">
                            <li><a href="#destaques" className="hover:text-black">About the Company</a></li>
                            <li><a href="#categorias" className="hover:text-black">Our Services</a></li>
                            <li><a href="#videos" className="hover:text-black">Our Guarantees</a></li>
                            <li><a href="#apps" className="hover:text-black">Business Inquiries</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="text-sm font-bold tracking-widest text-[#334155]">CONNECT</h4>
                        <div className="mt-4 grid gap-1.5 text-sm leading-6 text-[#64748b]">
                            <p>Talatona, Luanda Sul, Via AL16<br />Luanda, AO • {timeZone}</p>
                            <div className="mt-3 grid gap-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#334155]">{weekDayString} • {dateString}</p>
                                <p className="text-sm font-semibold text-[#1e293b]">{timeString} • Luanda</p>
                                <p className="text-xs">Seg - Sex, 9:00 - 17:00 {isOpen ? '(Aberto)' : '(Fechado)'}</p>
                            </div>
                            <a href="mailto:connecttics25@gmail.com" className="mt-2 hover:text-black">connecttics25@gmail.com</a>
                        </div>
                    </div>
                </div>

                {/* BOTTOM - coluna no celular, linha no desktop */}
                <div className="mt-14 flex flex-col gap-3 border-t border-[#e2e8f0] pt-6 text-xs text-[#94a3b8] sm:flex-row sm:items-center sm:justify-between">
                    <p className="leading-relaxed">© {year} Connect Tics Technologies. All rights reserved. {dateString} • Registration No. MC-2018-0992</p>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
                            <Link href="/legal" className="hover:text-black">Legal</Link>
                        </div>
                        <span className="hidden sm:block">|</span>
                        <span>Empowering global technology • {timeString}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
