export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import { Suspense } from "react";
import CreditNotes from "@/components/CreditNotes";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>

      <CreditNotes />
    </Suspense>
  )
}
