export default function Loading() {
  return (
    // Container Luar
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-10 animate-pulse">
      
      {/* Card Utama */}
      <div className="bg-white rounded-[3rem] shadow-xl w-full max-w-[85rem] flex flex-col md:flex-row overflow-hidden h-[850px] relative">
        
        {/*KOLOM KIRI*/}
        <div className="md:w-[45%] py-12 pr-10 pl-10 md:pl-52 flex flex-col justify-between border-r border-gray-50">
          
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between">
               <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
               <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-12 w-3/4 bg-gray-200 rounded-2xl mt-4"></div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          {/* Image Placeholder Skeleton */}
          <div className="flex items-center justify-center my-8">
            <div className="w-[280px] h-[280px] bg-gray-100 rounded-full flex items-center justify-center">
                 <div className="w-20 h-20 border-4 border-gray-300 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Evolution Chain Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
            <div className="flex justify-center gap-6">
               <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                 <div className="h-3 w-12 bg-gray-200 rounded"></div>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                 <div className="h-3 w-12 bg-gray-200 rounded"></div>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                 <div className="h-3 w-12 bg-gray-200 rounded"></div>
               </div>
            </div>
          </div>
        </div>

        {/*KOLOM KANAN*/}
        <div className="md:w-[55%] py-12 pl-10 pr-10 md:pr-52 flex flex-col bg-white">
          
          {/* Tabs Skeleton */}
          <div className="flex gap-8 mb-10 border-b border-gray-100 pb-4">
             <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
             <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
             <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
             <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>

          {/* Content Body Skeleton */}
          <div className="space-y-8">
             {/* Weakness */}
             <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                </div>
             </div>

             {/* Story */}
             <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
             </div>

             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
                <div className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
                <div className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
                <div className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
             </div>
             
             {/* Stats Bars */}
             <div className="space-y-3 mt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full w-1/2 bg-gray-300"></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full w-3/4 bg-gray-300"></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full w-1/3 bg-gray-300"></div>
                    </div>
                </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}