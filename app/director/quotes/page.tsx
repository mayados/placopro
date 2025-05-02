// app/director/creditNotes/page.tsx

import Quotes from "@/components/Quotes";

type Params = Promise<{ parameters: Record<string, string> }>;


export default async function CreditNotesPage({ searchParams }: { searchParams: Params }) {
    const resolvedParams = await searchParams;
    const { parameters } = resolvedParams;

  return <Quotes searchParams={parameters} />;
}
