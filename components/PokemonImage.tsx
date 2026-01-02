"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

// Wrapper Image Next.js dengan fitur Fallback jika gambar rusak
export default function PokemonImage(props: ImageProps) {
  const [src, setSrc] = useState(props.src);

  return (
    <Image
      {...props}
      src={src}
      onError={() => setSrc("/fallback-pokeball.png")} // Ganti gambar kalau error
      className={`${props.className} transition-opacity duration-500`}
    />
  );
}