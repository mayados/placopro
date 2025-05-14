export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { Suspense } from "react";
import CreditNotes from "@/components/CreditNotes";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement des données...</div>}>

      <CreditNotes />
    </Suspense>
  )
}
