
// import Bills from "@/components/Bills";

// type Params = Promise<{ parameters: Record<string, string> }>;


// export default async function Page({ searchParams }: { searchParams: Params }) {
//     const resolvedParams = await searchParams;
//     const { parameters } = resolvedParams;

//   return <Bills searchParams={parameters} />;
// }

import Bills from "@/components/Bills";
import { Suspense } from "react";

export default function Page() {

    return (
      <Suspense fallback={<div>Chargement des données...</div>}>
  
        <Bills />
      </Suspense>
    )

}
