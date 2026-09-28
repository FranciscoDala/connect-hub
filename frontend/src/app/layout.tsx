import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
    variable: "--font-jost",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Connect-tics",
    description: "Inovamos para liderar",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="pt"
            className={`${jost.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col font-[var(--font-jost)]" style={{ fontFamily: 'var(--font-jost), "Jost", sans-serif' }}>
                {children}
            </body>
        </html>
    );
}
