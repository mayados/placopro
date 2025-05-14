export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
import Quotes from "@/components/Quotes";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>

      <Quotes />;
    </Suspense>
  )

}
