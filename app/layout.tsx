import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Social",
  description:
    "Farme sua aura, mande para a galera e descubra como leem sua vibe.",
  manifest: "/manifest.json",
  themeColor: "#090A14",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura Social",
  },
  openGraph: {
    title: "Aura Social",
    description:
      "Farme sua aura, mande para a galera e descubra como leem sua vibe.",
    url: "https://aura-social-seven.vercel.app",
    siteName: "Aura Social",
    images: [
      {
        url: "/og-aura-social.png",
        width: 1200,
        height: 630,
        alt: "Aura Social - farme sua aura",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Social",
    description:
      "Farme sua aura, mande para a galera e descubra como leem sua vibe.",
    images: ["/og-aura-social.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#090A14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}