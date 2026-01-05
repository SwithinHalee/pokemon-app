"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

export default function PokemonImage(props: ImageProps) {
  const [src, setSrc] = useState(props.src);
  return (
    <Image
      {...props}
      src={src}
      onError={() => setSrc("/fallback-pokeball.png")}
      className={`${props.className} transition-opacity duration-500`}
    />
  );
}