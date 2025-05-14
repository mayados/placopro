export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import Bills from "@/components/Bills";
import { Suspense } from "react";

export default function Page() {

    return (
      <Suspense fallback={<div>Chargement des données...</div>}>
  
        <Bills />
      </Suspense>
    )

}
