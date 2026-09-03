import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Food Label Explainer",
  description: "Extract and examine text from packaged food labels using client-side OCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-primary font-sans antialiased flex flex-col">
        <header className="w-full border-b border-subtle bg-surface px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-base font-semibold tracking-tight text-primary">
              Food Label Explainer
            </h1>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
