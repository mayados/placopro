export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import Prospects from "@/components/Prospects";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Page() {

  return (
    <Suspense fallback={<LoadingSpinner />}>

      <Prospects />
    </Suspense>
  )

}
