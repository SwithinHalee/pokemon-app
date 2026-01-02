export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        {/* Lingkaran Luar */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
        {/* Lingkaran Putar (Spinner) */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-400 font-bold text-sm animate-pulse">
        Catching Pokémon...
      </p>
    </div>
  );
}