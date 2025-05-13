
// import WorkSites from "@/components/WorkSites";

// type Params = Promise<{ parameters: Record<string, string> }>;


// export default async function Page({ searchParams }: { searchParams: Params }) {
//     const resolvedParams = await searchParams;
//     const { parameters } = resolvedParams;

//   return <WorkSites searchParams={parameters} />;
// }

import WorkSites from "@/components/WorkSites";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement des données...</div>}>

      <WorkSites />
    </Suspense>
  )

}
