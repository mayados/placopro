// app/director/creditNotes/page.tsx

import CreditNotes from "@/components/CreditNotes";

type Params = Promise<{ parameters: Record<string, string> }>;


export default async function CreditNotesPage({ searchParams }: { searchParams: Params }) {
    const resolvedParams = await searchParams;
    const { parameters } = resolvedParams;

  return <CreditNotes searchParams={parameters} />;
}
