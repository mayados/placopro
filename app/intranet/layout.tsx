// app/(intranet)/directeur/layout.tsx

import type { Metadata } from "next";
// import DirectorNav from "@/components/DirectorNav";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import IntranetNav from "@/components/IntranetNav";

export const metadata: Metadata = {
  title: "Espace Directeur",
  description: "Interface intranet dédiée au directeur",
};

export default function DirecteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <IntranetNav />
    <main className="bg-custom-white min-h-screen pt-16 md:ml-64 p-4 text-black">
      {children}
      <Toaster />
    </main>
  </ClerkProvider>
  );
}
