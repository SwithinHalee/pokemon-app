interface StatBarProps {
  label: string;
  value: number;
  max?: number;
}

const StatBar = ({ label, value, max = 255 }: StatBarProps) => {
  // Hitung persentase lebar bar
  const percent = Math.min((value / max) * 100, 100);

  // Fungsi untuk menentukan warna gradasi yang lebih detail (6 Tingkatan)
  const getBarColor = (val: number) => {
    if (val < 30) return "bg-red-600";         // Sangat Rendah (Ex: Magikarp Speed)
    if (val < 60) return "bg-orange-500";      // Rendah
    if (val < 90) return "bg-yellow-400";      // Rata-rata (Standar Pokemon)
    if (val < 120) return "bg-lime-500";       // Bagus
    if (val < 150) return "bg-green-500";      // Sangat Bagus
    return "bg-cyan-500";                      // Dewa / Legendaris (150+)
  };

  return (
    <div className="flex items-center w-full">
      {/* LABEL:
        - w-[85px] md:w-28 : Lebar fix agar muat teks panjang
        - whitespace-nowrap : Mencegah teks turun baris (solusi masalah Sp. Atk)
      */}
      <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase w-[85px] md:w-28 whitespace-nowrap shrink-0">
        {label}
      </span>
      
      {/* ANGKA VALUE */}
      <span className="text-xs md:text-sm font-extrabold text-gray-900 w-8 md:w-10 text-right shrink-0 mr-3">
        {value}
      </span>

      {/* BAR CONTAINER */}
      <div className="h-1.5 md:h-2 w-full bg-gray-100 rounded-full overflow-hidden flex-grow">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(value)}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatBar;