import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { compressImage } from '../utils/imageCompression';
import { Edit, Trash2, Plus, X, Upload, Download, FileJson, Star } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ProductsManager() {
  const { categories, rawCategories, fetchProductsPage, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', category: '', stock: '', image: '', discount: 0, isRecommended: false });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [stockFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoadingList(true);
      try {
        const categoryCode =
          categoryFilter === 'all'
            ? null
            : rawCategories?.find(c => c.nombre === categoryFilter)?.codigo_categoria || null;

        const { items, hasMore: nextHasMore } = await fetchProductsPage({
          page: currentPage,
          pageSize: 25,
          categoryCode,
          searchQuery: debouncedSearch,
          stockFilter,
        });

        if (cancelled) return;
        setHasMore(Boolean(nextHasMore));
        setProducts(prev => (currentPage === 1 ? items : [...prev, ...items]));
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setIsLoadingList(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchProductsPage, rawCategories, categoryFilter, stockFilter, debouncedSearch, currentPage, reloadKey]);

  const handleOpenModal = (product = null) => {
    setImageFile(null);
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        ...product, 
        price: product.originalPrice !== undefined ? product.originalPrice : product.price,
        discount: product.discount || 0,
        isRecommended: product.isRecommended || false
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: categories.length > 0 ? categories[0] : '', stock: '', image: 'https://placehold.co/200x200/ef4444/white?text=Nuevo', discount: 0, unit: '', isRecommended: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        const compressed = await compressImage(imageFile, 800, 800, 0.8, 'image/webp');
        const fileExt = compressed.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(fileName, compressed);
          
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      const formattedData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        discount: parseFloat(formData.discount || 0),
        image: finalImageUrl
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, formattedData);
      } else {
        await addProduct(formattedData);
      }
      setIsModalOpen(false);
      setReloadKey(k => k + 1);
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert(`Error al guardar: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleRecommended = async (product) => {
    try {
      const newStatus = !product.isRecommended;
      await updateProduct(product.id, { isRecommended: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isRecommended: newStatus } : p));
    } catch (error) {
      console.error('Error toggling recommended:', error);
      alert('Error al actualizar el estado de recomendado.');
    }
  };

  // Función para exportar productos a JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `benmarket_productos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setReloadKey(k => k + 1);
    } catch (error) {
      alert(`Error al eliminar: ${error.message || 'Error desconocido'}`);
    }
  };

  // Función para importar productos desde JSON
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          // En un caso real, aquí deberíamos validar la estructura de cada objeto
          // y llamar a un método del contexto como `importProducts(importedData)`
          alert(`Simulación: Se importarían ${importedData.length} productos correctamente.`);
        } else {
          alert('El archivo no tiene el formato de array esperado.');
        }
      } catch (error) {
        alert('Error al leer el archivo JSON. Asegúrate de que el formato sea correcto.');
      }
    };
    reader.readAsText(file);
    // Limpiar el input para permitir importar el mismo archivo de nuevo si es necesario
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <select 
            className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-primary shadow-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="flex-1 md:flex-none px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-primary shadow-sm"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="in-stock">En Stock (&gt; 5)</option>
            <option value="low-stock">Stock Bajo (1 - 5)</option>
            <option value="out-of-stock">Sin Stock (0)</option>
          </select>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar producto..."
            className="flex-[2] md:flex-none px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-primary shadow-sm w-full md:w-[260px]"
          />

          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportData} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-300 shadow-sm"
            title="Importar productos desde JSON"
          >
            <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Importar DB</span><span className="sm:hidden">Importar</span>
          </button>

          <button 
            onClick={handleExportData} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-300 shadow-sm"
            title="Exportar productos a JSON"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar DB</span><span className="sm:hidden">Exportar</span>
          </button>

          <button onClick={() => handleOpenModal()} className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 ml-auto md:ml-2">
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-semibold">Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold text-right">Precio</th>
                <th className="p-4 font-semibold text-right">Stock</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{product.name}</span>
                      {product.unit && <span className="text-xs text-slate-400">Unidad: {product.unit}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{product.category}</td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                      {product.discount > 0 ? (
                        <>
                          <span className="font-bold text-slate-900">{formatCurrency(product.price)}</span>
                          <span className="text-xs text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-0.5">-{product.discount}%</span>
                        </>
                      ) : (
                        <span className="font-bold text-slate-900">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.stock === 0 ? 'bg-red-100 text-red-700' :
                      product.stock <= 5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => handleToggleRecommended(product)} 
                      className={`p-1.5 rounded transition-colors ${
                        product.isRecommended 
                          ? 'text-amber-500 hover:bg-amber-50' 
                          : 'text-slate-400 hover:bg-slate-100 hover:text-amber-500'
                      }`}
                      title={product.isRecommended ? "Quitar de Recomendados" : "Agregar a Recomendados"}
                    >
                      <Star className="w-4 h-4" fill={product.isRecommended ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => handleOpenModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-sm text-slate-500">
          {isLoadingList ? 'Cargando productos...' : `Mostrando ${products.length} productos`}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoadingList}
            className="px-4 py-2 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm font-semibold text-slate-500">Página {currentPage}</span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!hasMore || isLoadingList}
            className="px-4 py-2 rounded-lg font-bold bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio (PYG)</label>
                  <input required type="number" step="1" min="0" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descuento</label>
                  <select className="input-field" value={formData.discount || 0} onChange={e => setFormData({...formData, discount: Number(e.target.value)})}>
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={15}>15%</option>
                    <option value={20}>20%</option>
                    <option value={25}>25%</option>
                    <option value={30}>30%</option>
                    <option value={40}>40%</option>
                    <option value={50}>50%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input required type="number" min="0" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de Medida</label>
                  <input type="text" className="input-field" placeholder="Ej: kg, litro, unidad" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen del Producto</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                    {formData.image && formData.image !== 'https://placehold.co/200x200/ef4444/white?text=Nuevo' ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setFormData({ ...formData, image: URL.createObjectURL(file) });
                        }
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP. Se optimizará automáticamente.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isRecommended" 
                  checked={formData.isRecommended || false} 
                  onChange={e => setFormData({...formData, isRecommended: e.target.checked})} 
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isRecommended" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                  Producto Recomendado (Aparecerá en la página principal)
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
