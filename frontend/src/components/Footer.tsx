import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[#e2e8f0] bg-[#f1f5f9]">
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
                {/* linha fina topo igual print */}
                <div className="mb-12 h-px w-full bg-[#e2e8f0]" />

                <div className="grid gap-10 md:grid-cols-12">
                    {/* COLUNA 1 - LOGO */}
                    <div className="md:col-span-5">
                        <Link href="/" className="flex items-center">
                            <img src="/connect.png" alt="CONNECT" className="h-20 w-auto object-contain" />
                        </Link>
                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#64748b]">
                            Your trusted partner in advanced technology and digital excellence.
                        </p>
                    </div>

                    {/* COLUNA 2 - EXPLORE */}
                    <div className="md:col-span-3">
                        <h4 className="text-sm font-bold tracking-widest text-[#334155]">EXPLORE</h4>
                        <ul className="mt-4 grid gap-2.5 text-sm text-[#64748b]">
                            <li><a href="#destaques" className="hover:text-black">About the Company</a></li>
                            <li><a href="#categorias" className="hover:text-black">Our Services</a></li>
                            <li><a href="#videos" className="hover:text-black">Our Guarantees</a></li>
                            <li><a href="#apps" className="hover:text-black">Business Inquiries</a></li>
                        </ul>
                    </div>

                    {/* COLUNA 3 - OFFICE */}
                    <div className="md:col-span-4">
                        <h4 className="text-sm font-bold tracking-widest text-[#334155]">LUA OFFICE</h4>
                        <div className="mt-4 grid gap-1.5 text-sm leading-6 text-[#64748b]">
                            <p>Talatona, Luanda Sul, Via AL16<br />Luanda, AO</p>
                            <p className="mt-2">Monday - Friday, 9:00 AM - 5:00 PM</p>
                            <a href="mailto:geral@connect.ao" className="hover:text-black">geral@connect.ao</a>
                        </div>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="mt-14 flex flex-col gap-3 border-t border-[#e2e8f0] pt-6 text-xs text-[#94a3b8] sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 Connect Tics Technologies. All rights reserved. Registration No. MC-2018-0992</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
                        <Link href="/legal" className="hover:text-black">Legal</Link>
                        <span className="hidden sm:block">|</span>
                        <span>Empowering global technology.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
