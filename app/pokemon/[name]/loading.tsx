export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      {/* Container Utama (Card) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden min-h-[850px] relative animate-pulse">
        
        {/* === KOLOM KIRI (Visual Skeleton) === */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col relative z-10 bg-gray-50/50">
          
          {/* Header Skeleton */}
          <div className="w-full mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-48 bg-gray-200 rounded-lg"></div> {/* Nama */}
              <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>  {/* ID */}
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div> {/* Type Badge 1 */}
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div> {/* Type Badge 2 */}
            </div>
          </div>

          {/* Gambar Utama Skeleton */}
          <div className="flex-1 flex items-center justify-center py-8">
             <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-200 rounded-full opacity-50"></div>
          </div>

          {/* Evolution Chain Skeleton */}
          <div className="mt-8 flex flex-col items-center">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div> {/* Label Evolution */}
            <div className="flex gap-4">
               {/* 3 Lingkaran Evolusi */}
               <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
               <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
               <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* === KOLOM KANAN (Info Skeleton) === */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col">
          
          {/* Tabs Skeleton */}
          <div className="flex gap-8 border-b border-gray-100 mb-8 pb-4">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>

          {/* Weakness & Story Skeleton */}
          <div className="space-y-6 mb-8">
             <div className="h-4 w-24 bg-gray-200 rounded"></div>
             <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
             </div>
             
             <div className="mt-6">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
             </div>
          </div>

          {/* Info Grid Skeleton (Height, Weight, etc) */}
          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="h-20 bg-gray-100 rounded-xl"></div>
             <div className="h-20 bg-gray-100 rounded-xl"></div>
             <div className="h-20 bg-gray-100 rounded-xl"></div>
             <div className="h-20 bg-gray-100 rounded-xl"></div>
             <div className="col-span-2 h-20 bg-gray-100 rounded-xl"></div>
          </div>

          {/* Stats Bars Skeleton */}
          <div className="space-y-4">
             <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
             {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4">
                   <div className="h-3 w-12 bg-gray-200 rounded"></div>
                   <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div className="h-full w-1/2 bg-gray-200 rounded-full"></div>
                   </div>
                </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
}