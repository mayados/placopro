export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import WorkSites from "@/components/WorkSites";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement des données...</div>}>

      <WorkSites />
    </Suspense>
  )

}
