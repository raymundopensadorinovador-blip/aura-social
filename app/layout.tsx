import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Social",
  description:
    "Descubra sua energia social e veja como seus amigos te percebem.",
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