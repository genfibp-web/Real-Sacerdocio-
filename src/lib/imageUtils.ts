export const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/webp") return resolve(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo crear el contexto del canvas"));
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("No se pudo generar el archivo WebP"));
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], newFileName, { type: "image/webp" });
            resolve(webpFile);
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => reject(new Error("La imagen está corrupta o no es un formato válido"));
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
  });
};