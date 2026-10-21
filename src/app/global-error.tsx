// src/app/global-error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Detecta si el error es por un chunk desactualizado
    const isChunkError =
      error.name === "ChunkLoadError" ||
      /Loading chunk|dynamically imported module/i.test(error.message);

    if (isChunkError) {
      // Recarga una sola vez para evitar bucles infinitos
      const lastReload = sessionStorage.getItem("last-reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last-reload", now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Algo salió mal</h2>
          <p>El contenido se ha actualizado. Por favor, recarga la página.</p>
          <button onClick={() => reset()}>Reintentar</button>
        </div>
      </body>
    </html>
  );
}