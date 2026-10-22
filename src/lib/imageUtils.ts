export const convertToWebP = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Si ya es webp y es pequeño, lo dejamos pasar (opcional, pero lo procesamos por seguridad)
    if (file.type === "image/webp" && file.size < 300 * 1024) {
      return resolve(file);
    }

    // Usamos createObjectURL en lugar de FileReader (es más rápido y consume menos memoria)
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // 1. Redimensionar manteniendo la proporción si es muy grande
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No se pudo crear el contexto del canvas"));
      
      // 2. Dibujar en el tamaño reducido
      ctx.drawImage(img, 0, 0, width, height);
      
      // 3. Exportar con compresión
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("No se pudo generar el archivo WebP"));
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const webpFile = new File([blob], newFileName, { type: "image/webp" });
          resolve(webpFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("La imagen está corrupta o no es un formato válido"));
    };
  });
};