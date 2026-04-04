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
  title: {
    default: "Royal Gold Traders | Premium Gold Assets",
    template: "%s | Royal Gold Traders"
  },
  description: "Secure, transparent, and premium gold trading platform. Invest in 24K pure gold with institutional-grade security and real-time market tracking.",
  keywords: ["gold trading", "24k gold", "gold investment", "royal gold traders", "fintech gold", "buy gold india"],
  authors: [{ name: "Royal Gold Traders Team" }],
  creator: "Royal Gold Traders",
  publisher: "Royal Gold Traders",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://royalgoldtraders.in",
    siteName: "Royal Gold Traders",
    title: "Royal Gold Traders | Invest in 24K Pure Gold",
    description: "The ultimate centralized platform for premium gold trading. Secure, transparent, and built for the future.",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or I'll create a placeholder
        width: 1200,
        height: 630,
        alt: "Royal Gold Traders Premium Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Gold Traders | Premium Gold Assets",
    description: "The ultimate centralized platform for premium gold trading.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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


