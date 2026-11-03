import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    metadataBase: new URL("https://connect-uuo9.onrender.com"),
    title: "CONNECT Angola",
    description: "Agência digital focada em desenvolvimento de software, sites e aplicativos que geram resultados reais para empresas em Angola.",
    applicationName: "Connect",
    manifest: "/site.webmanifest",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "CONNECT Angola",
        description: "Agência digital focada em desenvolvimento de software, sites e aplicativos que geram resultados reais para empresas em Angola.",
        url: "https://connect-uuo9.onrender.com",
        siteName: "Connect",
        type: "website",
        images: [{ url: "/team/ceo.jpeg", width: 1200, height: 1200, alt: "Francisco J.M Dala - CEO da Connect" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "CONNECT Angola",
        description: "Agência digital focada em desenvolvimento de software, sites e aplicativos que geram resultados reais para empresas em Angola.",
        images: ["/team/ceo.jpeg"],
    },
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt" className={`${montserrat.variable} h-full antialiased scroll-smooth`}>
            <body className="flex min-h-full flex-col bg-[#f8fafc] text-[#334155] font-sans">
                {children}
            </body>
        </html>
    );
}
