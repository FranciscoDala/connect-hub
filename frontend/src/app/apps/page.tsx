"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AppsPage() {
    return (
        <main className="min-h-screen bg-stone-50">
            <Header />
            <div className="mx-auto max-w-7xl px-5 pt-24 pb-20 sm:px-8">
                <div className="flex items-center gap-3"><span className="h-px w-8 bg-sky-600" /><p className="text-xs font-bold uppercase tracking-widest text-sky-800">Apps</p></div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-700 sm:text-4xl">Nossos Apps.</h1>
                <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-slate-500">Baixe os aplicativos oficiais da CONNECT e tenha controle total dos seus equipamentos.</p>
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-6 shadow"><h3 className="text-sm font-bold">CONNECT App</h3><p className="mt-2 text-xs text-slate-500">Gestão completa dos dispositivos.</p><a href="#" className="mt-4 inline-block rounded-full bg-sky-600 px-5 py-2 text-xs font-bold text-white">Baixar</a></div>
                    <div className="rounded-3xl bg-white p-6 shadow"><h3 className="text-sm font-bold">CONNECT Clinic</h3><p className="mt-2 text-xs text-slate-500">Para clínicas e profissionais.</p><a href="#" className="mt-4 inline-block rounded-full bg-sky-600 px-5 py-2 text-xs font-bold text-white">Baixar</a></div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
