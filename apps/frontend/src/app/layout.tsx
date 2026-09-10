// @ts-nocheck
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./shopnepal-prefix.css";
import "./shopnepal-shop.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ShopNepal - eCommerce",
  description: "ShopNepal - Nepal's eCommerce storefront",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" style={{fontFamily: 'Poppins, sans-serif'}} suppressHydrationWarning>{children}
        <Script src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
