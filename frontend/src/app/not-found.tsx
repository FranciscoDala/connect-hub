"use client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-stone-50">
            <Header />
            <div className="mx-auto flex max-w-7xl flex-col items-center px-5 pb-20 pt-32 text-center sm:px-8 sm:pt-40">
                <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-sky-600" />
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-800">ERRO 404</p>
                    <span className="h-px w-8 bg-sky-600" />
                </div>

                <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-none tracking-tight text-slate-800 sm:text-7xl">
                    Página não encontrada.
                </h1>

                <p className="mt-6 max-w-xl text-justify text-sm leading-6 text-slate-500 sm:text-center">
                    A página que você está tentando acessar não existe, foi movida ou o link expirou.
                    Volte para o início e continue explorando nossos produtos e tecnologias.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <Link href="/" className="rounded-full bg-[#0e8ac2] px-8 py-3 text-sm font-bold text-white shadow transition hover:bg-sky-700">
                        Voltar ao INÍCIO
                    </Link>
                    <Link href="/eventos" className="rounded-full border bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                        Ver Eventos
                    </Link>
                </div>

                <div className="mt-16 grid w-full max-w-3xl place-items-center">
                    <div className="relative">
                        <div className="absolute -inset-10 rounded-full bg-sky-100 blur-3xl opacity-60" />
                        <img src="/connect.png" alt="CONNECT" className="relative h-24 w-auto opacity-20 grayscale sm:h-28" />
                    </div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">CONNECT - Tecnologia de ponta</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
