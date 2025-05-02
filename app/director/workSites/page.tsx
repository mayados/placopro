
import WorkSites from "@/components/WorkSites";

type Params = Promise<{ parameters: Record<string, string> }>;


export default async function Page({ searchParams }: { searchParams: Params }) {
    const resolvedParams = await searchParams;
    const { parameters } = resolvedParams;

  return <WorkSites searchParams={parameters} />;
}
