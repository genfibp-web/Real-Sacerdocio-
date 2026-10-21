"use client";

import { useState } from "react";

// Usamos una etiqueta <img> estándar aquí para evitar los bloqueos de dominio de Next.js
export default function SafeImage({ src, alt, className, fallbackSrc = "/logo_Rs.png", ...props }: any) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        console.error("Error cargando imagen, usando respaldo:", src);
        setImgSrc(fallbackSrc); // Si la imagen falla, muestra tu logo
      }}
    />
  );
}