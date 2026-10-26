import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Connect-tics",
  description: "Inovamos para liderar",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${montserrat.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#334155] font-sans selection:bg-[#0e8ac2]/20">
        <style>{`
          :root {
            --background-color: #f8fafc;
            --surface-color: #ffffff;
            --text-color: #1e293b;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --glass-border: #e2e8f0;
            --accent-color: #0e8ac2;
            --primary-color: #0f172a;
            --button-color: #0e8ac2;
            --primary-hover: #0c709e;
            --shadow-soft: 0 4px 20px rgba(15,23,42,0.06);
            --shadow-button: 0 8px 20px rgba(14,138,194,0.25);
          }
          .section-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #0e8ac2; display:flex; align-items:center; gap:12px; }
          .section-kicker:before { content:''; width:32px; height:1px; background:#0e8ac2; display:inline-block; }
          .section-pad { padding-top: 96px; padding-bottom: 96px; }
        `}</style>
        {children}
      </body>
    </html>
  );
}
