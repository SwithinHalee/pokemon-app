interface Props {
  label: string;
  value: number;
  max?: number;
}

export default function StatBar({ label, value, max = 255 }: Props) {
  // Hitung persentase lebar bar
  const percentage = Math.min((value / max) * 100, 100);

  // Tentukan warna bar berdasarkan nilai (Merah -> Hijau)
  const colorClass = value < 60 ? "bg-red-500" : value < 90 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-16 font-bold text-gray-500 uppercase">{label}</span>
      <span className="w-8 font-bold text-gray-800 text-right">{value}</span>
      
      {/* Bar Container */}
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        {/* Bar Isi */}
        <div 
            className={`h-full rounded-full ${colorClass}`} 
            style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}