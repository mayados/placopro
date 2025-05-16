export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import Clients from "@/components/Clients";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Page() {

  return (
    <Suspense fallback={<LoadingSpinner />}>

      <Clients />
    </Suspense>
  )

}
