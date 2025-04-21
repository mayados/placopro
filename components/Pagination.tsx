"use client";

import { useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  pageParam: string;
  total: number;
  limit: number;
};

export const Pagination = ({ pageParam, total, limit }: PaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get(pageParam) || "1", 10);
  const totalPages = Math.ceil(total / limit);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center my-6">
      <button
        onClick={() => setPage(currentPage - 1)}
        disabled={!hasPrev}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Précédent
      </button>

      <span>
        Page {currentPage} sur {totalPages}
      </span>

      <button
        onClick={() => setPage(currentPage + 1)}
        disabled={!hasNext}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  );
};
