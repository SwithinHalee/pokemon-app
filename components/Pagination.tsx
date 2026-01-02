"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(page.toString());

  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  const handlePageChange = (e: React.FormEvent) => {
    e.preventDefault();
    let pageNumber = parseInt(inputPage);

    if (isNaN(pageNumber)) return;

    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    
    router.push(`/?${params.toString()}`);
  };

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex justify-center items-center gap-4 py-8 mt-4">
      {hasPrev ? (
        <Link
          href={`/?page=${page - 1}`}
          className="px-5 py-2 bg-white text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 border border-gray-200 transition-all text-sm"
        >
          Prev
        </Link>
      ) : (
        <button
          disabled
          className="px-5 py-2 bg-gray-100 text-gray-400 font-bold rounded-full border border-gray-200 cursor-not-allowed text-sm"
        >
          Prev
        </button>
      )}

      <form onSubmit={handlePageChange} className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
        <span className="text-gray-500 text-sm font-medium">Page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-12 text-center border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none font-bold text-gray-800 text-sm py-1 appearance-none"
        />
        <span className="text-gray-500 text-sm font-medium">of {totalPages}</span>
        <button 
            type="submit"
            className="ml-2 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </form>

      {hasNext ? (
        <Link
          href={`/?page=${page + 1}`}
          className="px-5 py-2 bg-blue-500 text-white font-bold rounded-full shadow-md hover:bg-blue-600 shadow-blue-200 transition-all text-sm"
        >
          Next
        </Link>
      ) : (
        <button
          disabled
          className="px-5 py-2 bg-gray-100 text-gray-400 font-bold rounded-full border border-gray-200 cursor-not-allowed text-sm"
        >
          Next
        </button>
      )}
    </div>
  );
}