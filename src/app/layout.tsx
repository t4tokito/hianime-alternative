import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "TokitoTV - Watch Anime Online Free | Tokito Anime Hub",
    template: "%s | TokitoTV",
  },
  description:
    "Watch anime online for free on TokitoTV. Stream subbed and dubbed anime episodes without ads. Your ultimate Tokito Anime Hub — search, watch, and track your favorite anime.",
  keywords: [
    "tokito tv",
    "tokitotv",
    "tokito anime",
    "tokito hub",
    "tokito lab",
    "tokito",
    "watch anime online",
    "free anime streaming",
    "anime episodes",
    "subbed anime",
    "dubbed anime",
    "anime watch online",
    "watch anime free",
    "anime streaming site",
  ],
  authors: [{ name: "TokitoTV" }],
  creator: "TokitoTV",
  publisher: "TokitoTV",
  metadataBase: new URL("https://tokitotv.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tokitotv.com",
    siteName: "TokitoTV",
    title: "TokitoTV - Watch Anime Online Free | Tokito Anime Hub",
    description:
      "Watch anime online for free on TokitoTV. Stream subbed and dubbed anime episodes without ads. Your ultimate Tokito Anime Hub.",
    images: [
      {
        url: "https://tokitotv.com/logo.jpg",
        width: 1200,
        height: 630,
        alt: "TokitoTV - Watch Anime Online Free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TokitoTV - Watch Anime Online Free",
    description:
      "Watch anime online for free on TokitoTV. Stream subbed and dubbed anime episodes without ads.",
    images: ["https://tokitotv.com/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "any" },
      { url: "/logo.jpg", type: "image/jpeg", sizes: "192x192" },
      { url: "/logo.jpg", type: "image/jpeg", sizes: "512x512" },
    ],
    apple: "/logo.jpg",
  },
  other: {
    "google-site-verification": "",
  },
  alternates: {
    canonical: "https://tokitotv.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TokitoTV",
              alternateName: ["Tokito TV", "Tokito Anime", "Tokito Hub", "Tokito Lab"],
              url: "https://tokitotv.com",
              image: "https://tokitotv.com/logo.jpg",
              description:
                "Watch anime online for free. Stream subbed and dubbed anime episodes without ads.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://tokitotv.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <footer className="border-t border-border py-8 text-center text-muted text-sm">
            <p>TokitoTV does not store any files on our server.</p>
            <p className="mt-1">We only link to media hosted on 3rd party services.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
