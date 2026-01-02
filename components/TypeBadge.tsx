import { TYPE_COLORS } from "@/lib/constants";

interface TypeBadgeProps {
  type: string;
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const colorClass = TYPE_COLORS[type.toLowerCase()] || "bg-gray-400";

  return (
    <span
      className={`${colorClass} text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}
    >
      {type}
    </span>
  );
}