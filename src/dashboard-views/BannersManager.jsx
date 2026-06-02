import React, { useState, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, CheckCircle, XCircle, Info, Upload, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { compressImage } from '../utils/imageCompression';

export default function BannersManager() {
  const { banners, addBanner, updateBannerStatus, deleteBanner } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: '', active: true });
  const fileInputRef = useRef(null);

  const handleOpenModal = () => {
    setImageFile(null);
    setFormData({ name: '', image: '', active: true });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        const compressed = await compressImage(imageFile, 1920, 1080, 0.9);
        const fileExt = compressed.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, compressed);
          
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrlData.publicUrl;
      } else if (!formData.image) {
        alert('Por favor selecciona o introduce una imagen para el banner.');
        setIsUploading(false);
        return;
      }

      await addBanner({
        name: formData.name,
        image: finalImageUrl,
        active: formData.active
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error guardando banner:', error);
      alert(`Error al guardar banner: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await updateBannerStatus(id);
    } catch (err) {
      alert('Error al actualizar el estado del banner: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este banner?')) {
      try {
        await deleteBanner(id);
      } catch (err) {
        alert('Error al eliminar el banner: ' + err.message);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Banners</h1>
          <p className="text-slate-500 text-sm mt-1">Administra los banners publicitarios que se muestran en la tienda.</p>
        </div>
        
        <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
          <Plus className="w-4 h-4" /> Nuevo Banner
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Tamaño ideal de imagen</h4>
          <p className="text-blue-800 text-sm mt-1">
            Para que los banners se vean perfectos en la página inicial en todos los dispositivos, te recomendamos usar imágenes con una resolución de <strong>1920x800 píxeles</strong> (formato horizontal panorámico).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl text-center border border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay banners configurados.</p>
          </div>
        ) : (
          banners.map(banner => (
            <div key={banner.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="h-40 bg-slate-100 relative group">
                <img src={banner.image} alt={banner.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                  {banner.active ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Activo
                    </span>
                  ) : (
                    <span className="bg-slate-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Inactivo
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-slate-800 mb-4">{banner.name}</h3>
                <button 
                  onClick={() => toggleStatus(banner.id)}
                  className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                    banner.active 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {banner.active ? 'Desactivar Banner' : 'Activar Banner'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nuevo Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Agregar Nuevo Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Título</label>
                <input 
                  required 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej: Promo Navidad"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen del Banner (1920x800px recomendado)</label>
                <div className="flex flex-col gap-3">
                  <div className="w-full h-32 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative hover:bg-slate-100 transition-colors">
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {
                            setImageFile(null);
                            setFormData({ ...formData, image: '' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex flex-col items-center gap-2 cursor-pointer p-4 text-center w-full"
                      >
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-xs text-slate-500 font-semibold">Haz clic para subir una imagen</span>
                        <span className="text-[10px] text-slate-400">Resolución recomendada: 1920x800</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setFormData({ ...formData, image: URL.createObjectURL(file) });
                      }
                    }}
                    className="hidden"
                  />
                  <div className="text-center text-xs text-slate-400">- O -</div>
                  <div>
                    <input 
                      type="url" 
                      className="input-field" 
                      placeholder="Pega la URL de la imagen si ya está subida"
                      value={formData.image && !imageFile ? formData.image : ''} 
                      onChange={e => {
                        setImageFile(null);
                        setFormData({...formData, image: e.target.value});
                      }} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.active}
                  onChange={e => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">
                  Activar banner inmediatamente
                </label>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={isUploading}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isUploading}>
                  {isUploading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
