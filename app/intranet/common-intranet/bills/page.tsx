export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import Bills from "@/components/Bills";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default function Page() {

  return (
    <Suspense fallback={<LoadingSpinner />}>

      <Bills />
    </Suspense>
  )

}
