"use client";

import Image from "next/image";
import { useState } from "react";

interface PokemonImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function PokemonImage({ src, alt, width = 200, height = 200, className }: PokemonImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
      onError={() => {
        setImgSrc("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"); // Fallback ke placeholder atau API default
      }}
    />
  );
}