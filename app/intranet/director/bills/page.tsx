
// import Bills from "@/components/Bills";

// type Params = Promise<{ parameters: Record<string, string> }>;


// export default async function Page({ searchParams }: { searchParams: Params }) {
//     const resolvedParams = await searchParams;
//     const { parameters } = resolvedParams;

//   return <Bills searchParams={parameters} />;
// }
import { Suspense } from "react";

import Bills from "@/components/Bills";

export default function Page() {
  <Suspense fallback={<div>Chargement...</div>}>

    return <Bills />;
  </Suspense>

}
