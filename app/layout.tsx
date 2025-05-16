// app/layout.tsx
import "./globals.css";

import ClientProviders from "@/components/ClientProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
      <html lang="fr" className="h-full">
        <body className="flex flex-col h-full min-h-screen antialiased">
            <ClientProviders>{children}</ClientProviders>

        </body>
      </html>
  );
}
