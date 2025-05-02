
import Bills from "@/components/Bills";

type Params = Promise<{ parameters: Record<string, string> }>;


export default async function Page({ searchParams }: { searchParams: Params }) {
    const resolvedParams = await searchParams;
    const { parameters } = resolvedParams;

  return <Bills searchParams={parameters} />;
}
