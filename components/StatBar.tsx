interface StatBarProps {
  label: string;
  value: number;
  max?: number;
}

export default function StatBar({ label, value, max = 255 }: StatBarProps) {
  const percentage = (value / max) * 100;

  // Logic Warna: < 50 Merah, 50-89 Kuning, >= 90 Hijau
  let colorClass = "bg-green-500";
  if (value < 50) colorClass = "bg-red-400";
  else if (value < 90) colorClass = "bg-amber-400";

  return (
    <div className="flex items-center w-full mb-3 text-sm">
      <span className="w-24 font-bold text-gray-400 uppercase text-xs tracking-wider">
        {label}
      </span>
      <span className="w-12 font-bold text-gray-800 mr-4 text-right">
        {value}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}