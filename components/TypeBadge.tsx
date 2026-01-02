import { TYPE_COLORS } from "@/lib/constants";

interface Props {
  type: string;
  className?: string; // Opsional: untuk custom ukuran font/padding
}

export default function TypeBadge({ type, className = "" }: Props) {
  // Ambil warna dari constants, fallback ke abu-abu jika tidak ada
  const colorClass = TYPE_COLORS[type.toLowerCase()] || "bg-gray-400";

  return (
    <span 
      className={`
        ${colorClass} 
        ${className}
        text-white font-bold capitalize rounded-full shadow-sm text-center
        px-3 py-1 text-[10px] md:text-xs
      `}
    >
      {type}
    </span>
  );
}