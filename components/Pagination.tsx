interface Props {
  onLoadMore: () => void; // Fungsi yang dijalankan saat klik
  loading: boolean;       // Status loading
  hasMore: boolean;       // Apakah masih ada data sisa?
}

export default function Pagination({ onLoadMore, loading, hasMore }: Props) {
  // Jika data habis, sembunyikan tombol
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-8 pb-4">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            {/* SVG Spinner Sederhana */}
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          "Load More Pokémon"
        )}
      </button>
    </div>
  );
}