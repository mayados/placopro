export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import LoadingSpinner from "@/components/LoadingSpinner";
import WorkSites from "@/components/WorkSites";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>

      <WorkSites />
    </Suspense>
  )

}
