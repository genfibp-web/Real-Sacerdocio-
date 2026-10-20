"use client";

import { useState } from "react";
import { Heart, Image as ImageIcon, X, Download, Loader2, FileArchive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import JSZip from "jszip"; // <-- IMPORTAMOS LA LIBRERÍA

export default function CommunityFeed({ publicaciones }: { publicaciones: any[] }) {
  const [posts, setPosts] = useState(publicaciones || []);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleLike = async (id: string, currentLikes: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    await supabase.from('publicaciones').update({ likes: currentLikes + 1 }).eq('id', id);
  };

  // Función auxiliar para convertir cualquier imagen a JPG (Blob)
  const getJpegBlob = (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No se pudo crear el canvas");
        
        ctx.fillStyle = "#FFFFFF"; // Fondo blanco para JPG
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Error al crear el blob");
        }, "image/jpeg", 0.95);
      };
      img.onerror = reject;
    });
  };

  // DESCARGA INDIVIDUAL (Para las fotos dentro de la galería)
  const handleDownloadSingle = async (url: string, filename: string, id: string) => {
    setDownloadingId(id);
    try {
      const blob = await getJpegBlob(url);
      const jpgUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = jpgUrl;
      link.download = filename.replace(/\.[^/.]+$/, "") + ".jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(jpgUrl);
    } catch (error) {
      alert("No se pudo procesar la imagen. Intentando descargar el original...");
      window.open(url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  // DESCARGA COMPLETA EN ZIP (El nuevo botón del Feed)
  const handleDownloadZip = async (post: any) => {
    setDownloadingId(`zip-${post.id}`);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder(`Recuerdos-${post.titulo.replace(/ /g, '-')}`);

      // 1. Agregar Portada
      if (post.portada_url) {
        const coverBlob = await getJpegBlob(post.portada_url);
        folder?.file("00-Portada.jpg", coverBlob);
      }

      // 2. Agregar Fotos de la galería
      if (post.fotos && post.fotos.length > 0) {
        for (let i = 0; i < post.fotos.length; i++) {
          const fotoBlob = await getJpegBlob(post.fotos[i]);
          folder?.file(`Foto-${i + 1}.jpg`, fotoBlob);
        }
      }

      // 3. Generar el archivo ZIP y descargarlo
      const content = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(content);
      
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = `Recuerdos-${post.titulo.replace(/ /g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);

    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar el archivo ZIP. Es posible que falten permisos en las imágenes.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.length === 0 ? (
        <div className="col-span-full text-center py-16 bg-real-dark rounded-3xl border border-white/5">
          <p className="text-gray-500">Aún no hay fotos ni publicaciones en esta comunidad.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-real-dark border border-white/5 rounded-3xl overflow-hidden hover:border-real-purple/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg flex flex-col">
            
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
              {post.portada_url ? (
                <img 
                  src={post.portada_url} 
                  alt={post.titulo} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer" 
                  onClick={() => setSelectedPost(post)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ImageIcon size={14} /> {post.fotos?.length || 0}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="font-serif text-xl font-bold text-white mb-2 leading-tight">{post.titulo}</h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">{post.descripcion}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleLike(post.id, post.likes)}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group/like"
                >
                  <Heart size={20} className="group-hover/like:scale-125 transition-transform" />
                  <span className="font-medium text-sm">{post.likes}</span>
                </button>
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="text-real-purple text-sm font-semibold hover:text-white transition-colors"
                >
                  Ver Galería
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* MODAL DE GALERÍA */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-5xl bg-real-dark rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="font-serif text-2xl font-bold text-white">{selectedPost.titulo}</h3>
              <div className="flex items-center gap-3">
                {/* BOTÓN DE DESCARGA TOTAL EN ZIP */}
                <button 
                  onClick={() => handleDownloadZip(selectedPost)}
                  disabled={downloadingId === `zip-${selectedPost.id}`}
                  className="flex items-center gap-2 bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg disabled:opacity-50"
                >
                  {downloadingId === `zip-${selectedPost.id}` ? (
                    <><Loader2 className="animate-spin" size={16} /> Creando ZIP...</>
                  ) : (
                    <><FileArchive size={16} /> Descargar Todo (ZIP)</>
                  )}
                </button>
                <button onClick={() => setSelectedPost(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 md:p-6">
              <p className="text-gray-300 mb-6">{selectedPost.descripcion}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portada en la galería (con su botón individual) */}
                {selectedPost.portada_url && (
                  <div className="relative group/img overflow-hidden rounded-xl">
                    <img src={selectedPost.portada_url} alt="Portada" className="w-full h-auto object-cover" />
                    <button 
                      onClick={() => handleDownloadSingle(selectedPost.portada_url, `Portada-${selectedPost.titulo}`, 'portada')}
                      className="absolute bottom-3 right-3 bg-black/70 hover:bg-real-purple text-white p-2.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/img:opacity-100 flex items-center justify-center w-10 h-10"
                    >
                      {downloadingId === 'portada' ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    </button>
                  </div>
                )}

                {/* Fotos de la galería */}
                {selectedPost.fotos?.map((foto: string, i: number) => (
                  <div key={i} className="relative group/img overflow-hidden rounded-xl">
                    <img src={foto} alt={`Foto ${i}`} className="w-full h-auto object-cover" />
                    <button 
                      onClick={() => handleDownloadSingle(foto, `Foto-${selectedPost.titulo}-${i + 1}`, `foto-${i}`)}
                      className="absolute bottom-3 right-3 bg-black/70 hover:bg-real-purple text-white p-2.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/img:opacity-100 flex items-center justify-center w-10 h-10"
                    >
                      {downloadingId === `foto-${i}` ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}