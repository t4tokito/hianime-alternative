import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Hianime - Watch Anime Online Free",
  description: "Watch anime online for free. Stream the latest subbed and dubbed anime episodes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <footer className="border-t border-border py-8 text-center text-muted text-sm">
          <p>Hianime does not store any files on our server.</p>
          <p className="mt-1">We only link to media hosted on 3rd party services.</p>
        </footer>
      </body>
    </html>
  );
}
