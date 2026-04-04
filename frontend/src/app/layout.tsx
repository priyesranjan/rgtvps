import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/ui/PageTransition";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royal Gold Traders",
  description: "The ultimate centralized platform for premium gold trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans min-h-screen overflow-x-hidden`)}
      >
        <ThemeProvider>
          <Navbar />
          {/* Premium gold progress bar on every navigation click */}
          <NextTopLoader
            color="#D4AF37"
            initialPosition={0.1}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={300}
            shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
          />
          <PageTransition>
            {children}
          </PageTransition>
          <FloatingWhatsApp />
        </ThemeProvider>
      </body>
    </html>
  );
}


