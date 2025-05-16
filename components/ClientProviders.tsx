// app/ClientProviders.tsx
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";


export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname() ?? "";
    const isIntranet = pathname.startsWith("/intranet");

    return (
        <ClerkProvider>
            {/* public Nav only if we are not in /intranet */}
            {!isIntranet && <Nav logo="Placopro" />}
            <main className="flex-grow bg-custom-white lg:pt-[8vh]">
                {children}
                <Toaster />
            </main>
            {!isIntranet && <Footer />}
        </ClerkProvider>
    );
}
