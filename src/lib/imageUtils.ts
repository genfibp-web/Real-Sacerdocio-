// 1. FUNCIÓN GENERAL (Para eventos, galería, publicaciones)
export const convertToWebP = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/webp" && file.size < 300 * 1024) {
      return resolve(file);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No se pudo crear el contexto del canvas"));
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("No se pudo generar el archivo WebP"));
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          resolve(new File([blob], newFileName, { type: "image/webp" }));
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

// 2. FUNCIÓN PARA AVATARES (Recorta en cuadrado, 800x800, máxima calidad)
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

      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Error al generar WebP"));
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          resolve(new File([blob], newFileName, { type: "image/webp" }));
        },
        "image/webp",
        quality 
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Error al leer la imagen"));
    };
  });
};