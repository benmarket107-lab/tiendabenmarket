import React, { useState, useRef } from 'react';
import { Pencil, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { compressImage } from '../utils/imageCompression';

export default function CategoriesManager() {
  const { rawCategories, updateCategory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);

  const handleEditClick = (cat) => {
    setSelectedCategory(cat);
    setPreviewImage(cat.foto_url || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalImageUrl = previewImage;

      if (imageFile) {
        const compressed = await compressImage(imageFile, 800, 800, 0.8, 'image/webp');
        const fileExt = compressed.name.split('.').pop();
        const fileName = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
           .from('productos')
           .upload(fileName, compressed);
          
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      if (selectedCategory && finalImageUrl !== selectedCategory.foto_url) {
        await updateCategory(selectedCategory.codigo_categoria, {
          foto_url: finalImageUrl
        });
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert(`Error al guardar categoría: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Categorías</h1>
          <p className="text-slate-500 text-sm mt-1">Administra los iconos o imágenes de las categorías.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {(rawCategories || []).map(cat => (
          <div key={cat.codigo_categoria} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col items-center p-4">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 overflow-hidden border border-slate-200">
              {cat.foto_url ? (
                <img src={cat.foto_url} alt={cat.nombre} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-center">{cat.nombre}</h3>
            <button 
              onClick={() => handleEditClick(cat)}
              className="mt-auto flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
            >
              <Pencil className="w-4 h-4" /> Editar Imagen
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                Editar Categoría
              </h2>
              <button 
                onClick={() => !isUploading && setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                  <input 
                    type="text" 
                    value={selectedCategory?.nombre || ''}
                    disabled
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Imagen de la Categoría</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    
                    {previewImage ? (
                      <div className="space-y-3">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="mx-auto h-32 w-32 object-cover rounded-full shadow-md border border-slate-200"
                        />
                        <p className="text-sm text-slate-500 font-medium group-hover:text-primary transition-colors">
                          Haz clic para cambiar la imagen
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Subir una imagen</p>
                          <p className="text-xs text-slate-500 mt-1">Recomendado: 800x800px (JPG, PNG, WEBP)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isUploading}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-primary/20"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
