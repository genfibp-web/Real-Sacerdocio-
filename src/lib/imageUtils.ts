// Nueva función exclusiva para Avatares: Recorta al centro, hace cuadrado y mantiene alta calidad
export const convertToWebPAvatar = (file: File, size = 800, quality = 0.9): Promise<File> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No se pudo crear el contexto"));

      // Calcular el recorte cuadrado centrado
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      // Mejorar la calidad del escalado (suavizado)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Dibujar solo el cuadrado central en el canvas de 800x800
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Error al generar WebP"));
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          resolve(new File([blob], newFileName, { type: "image/webp" }));
        },
        "image/webp",
        quality // 0.9 = 90% de calidad (se ve idéntico al original)
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Error al leer la imagen"));
    };
  });
};