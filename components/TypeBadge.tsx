import { TYPE_COLORS } from "@/lib/constants";

interface Props {
  type: string;
  className?: string;
}

/* Badge berwarna untuk menandakan tipe pokemon */
export default function TypeBadge({ type, className = "" }: Props) {
  const colorClass = TYPE_COLORS[type.toLowerCase()] || "bg-gray-400";
  return (
    <span className={`${colorClass} ${className} text-white font-bold capitalize rounded-full shadow-sm text-center px-3 py-1 text-[10px] md:text-xs`}>
      {type}
    </span>
  );
}