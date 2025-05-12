// app/layout.tsx
"use client";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isIntranet = pathname.startsWith("/intranet");

  return (
    <ClerkProvider>
      <html lang="fr" className="h-full">
        <body className="flex flex-col h-full min-h-screen antialiased">
          {/* public Nav only if we are not in /intranet */}
          {!isIntranet && <Nav logo="Placopro" />}

          <main className="flex-grow bg-custom-white lg:pt-[8vh]">
            {children}
            <Toaster />
          </main>

          {/* common footer */}
          {!isIntranet && <Footer />}

        </body>
      </html>
    </ClerkProvider>
  );
}
