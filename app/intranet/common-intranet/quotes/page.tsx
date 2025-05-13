// // app/director/creditNotes/page.tsx

// import Quotes from "@/components/Quotes";

// // type Params = Promise<{ parameters: Record<string, string> }>;


// export default async function Page({ searchParams }: { searchParams: Record<string, string> }) {
//     // const resolvedParams = await searchParams;
//     // const { parameters } = resolvedParams;
//     // console.log("les parameters de la page : "+JSON.stringify(resolvedParams))

//   return <Quotes searchParams={searchParams} />;
// }
// app/intranet/director/quotes/page.tsx

// app/intranet/director/quotes/page.tsx

// app/intranet/director/quotes/page.tsx

// import Quotes from "@/components/Quotes";

// type Props = {
//   // Next.js injecte searchParams en tant que Promise<any> selon ses types générés
//   searchParams?: Promise<Record<string, string | string[]>>;
// };

// export default async function Page({ searchParams }: Props) {
//   // on await la promise pour récupérer l'objet
//   const raw = (await searchParams) ?? {};
//   // si next t'a mis string[] pour un param, on ne garde que le premier élément
//   const normalized: Record<string, string> = Object.fromEntries(
//     Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
//   );

//   return <Quotes searchParams={normalized} />;
// }

// app/intranet/director/quotes/page.tsx
import Quotes from "@/components/Quotes";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>

      <Quotes />;
    </Suspense>
  )

}
