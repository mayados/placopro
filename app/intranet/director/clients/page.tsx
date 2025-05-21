export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import PseudonymizedClients from "@/components/PseudonymizedClients";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Page() {

  return (
    <Suspense fallback={<LoadingSpinner />}>

      <PseudonymizedClients />
    </Suspense>
  )

}
