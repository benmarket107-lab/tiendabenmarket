import { createContext, useState, useContext, useEffect } from 'react';
import { sales as mockSales, cashReconciliations as mockArqueos } from '../data/mock';
import { supabase } from '../supabaseClient';
import tiendaImg from '../images/tienda.jpg';
import bannerImg from '../images/banner.png';

const AppContext = createContext();
const DEFAULT_BANNERS = [
  { id: 1, name: 'Banner Principal Web', image: tiendaImg, active: true },
  { id: 2, name: 'Promo Fin de Semana', image: bannerImg, active: true },
];
const PRODUCT_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23f8fafc'/><text x='200' y='210' font-size='18' text-anchor='middle' fill='%2394a3b8' font-family='Arial, sans-serif'>Sin imagen</text></svg>";

export const AppProvider = ({ children }) => {
  const [productById, setProductById] = useState({});
  const [sales, setSales] = useState(mockSales);
  const [arqueos, setArqueos] = useState(mockArqueos);
  const [users, setUsers] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [themeColor, setThemeColor] = useState(null);

  const [categories, setCategories] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannersReady, setBannersReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Banners
      const { data: bannerData, error: bannerError } = await supabase
        .from('banners')
        .select('*')
        .order('id', { ascending: true });
      
      if (bannerError) {
        console.error('Error fetching banners:', bannerError);
        setBanners(DEFAULT_BANNERS);
      } else if (bannerData && bannerData.length > 0) {
        setBanners(bannerData.map(b => ({
          id: b.id,
          name: b.name,
          image: b.image,
          active: b.active
        })));
      } else {
        setBanners([]);
      }
      setBannersReady(true);

      // Fetch Theme Colors
      const { data: themeData, error: themeError } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'theme_colors')
        .maybeSingle();
      
      if (!themeError && themeData && themeData.valor) {
        try {
          const colors = JSON.parse(themeData.valor);
          setThemeColor(colors);
          applyThemeToDocument(colors);
        } catch(e) {
          console.error("Error parsing theme colors", e);
        }
      }

      // Fetch delivery price from configuracion table
      const { data: configData, error: configError } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'delivery_price')
        .maybeSingle();
      if (!configError && configData) {
        setDeliveryPrice(Number(configData.valor) || 0);
      }

      // Fetch whatsapp number from configuracion table
      const { data: waData, error: waError } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'whatsapp_number')
        .maybeSingle();
      if (!waError && waData) {
        setWhatsappNumber(waData.valor || '');
      } else {
        setWhatsappNumber(import.meta.env.VITE_WHATSAPP_NUMBER || '595981000000');
      }

      // Fetch Categories
      const { data: catData, error: catError } = await supabase.from('categorias').select('*');
      if (catError) {
        console.error('Error fetching categories:', catError);
      } else {
        setRawCategories(catData || []);
        const mappedCategories = (catData || []).map(c => c.nombre);
        setCategories(mappedCategories);
      }

      // Fetch Users
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .order('name', { ascending: true });
      if (userError) {
        console.error('Error fetching users:', userError);
      } else {
        setUsers(userData || []);
      }

      // Fetch Pedidos
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (pedidosError) {
        console.error('Error fetching pedidos:', pedidosError);
      } else {
        setPedidos(pedidosData || []);
      }
    };
    fetchData();
  }, []);

  const fetchProductsPage = async ({
    page = 1,
    pageSize = 24,
    categoryCode = null,
    searchQuery = '',
  } = {}) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('productos')
      .select('codigo_producto,nombre,precio,cantidad_disponible,foto_url,categorias(nombre)', { count: 'estimated' })
      .order('nombre', { ascending: true });

    if (categoryCode) {
      query = query.eq('codigo_categoria', categoryCode);
    }

    const q = String(searchQuery || '').trim();
    if (q) {
      query = query.ilike('nombre', `%${q}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) {
      throw error;
    }

    const items = (data || []).map(p => ({
      id: p.codigo_producto,
      name: p.nombre,
      price: p.precio,
      stock: p.cantidad_disponible,
      image: p.foto_url || PRODUCT_PLACEHOLDER_IMAGE,
      category: p.categorias?.nombre || 'Sin Categoría'
    }));

    const hasMore = typeof count === 'number' ? to + 1 < count : items.length === pageSize;

    return { items, hasMore, total: count };
  };

  const getProductById = async (id) => {
    if (!id) return null;
    if (productById[id]) return productById[id];

    const { data, error } = await supabase
      .from('productos')
      .select('codigo_producto,nombre,precio,cantidad_disponible,foto_url,categorias(nombre)')
      .eq('codigo_producto', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;

    const mapped = {
      id: data.codigo_producto,
      name: data.nombre,
      price: data.precio,
      stock: data.cantidad_disponible,
      image: data.foto_url || PRODUCT_PLACEHOLDER_IMAGE,
      category: data.categorias?.nombre || 'Sin Categoría'
    };

    setProductById(prev => ({ ...prev, [id]: mapped }));
    return mapped;
  };

  // Funciones de Productos
  const addProduct = async (product) => {
    const newId = Date.now().toString();
    const cat = rawCategories.find(c => c.nombre === product.category);
    const dbProduct = {
      codigo_producto: newId,
      nombre: product.name,
      precio: product.price,
      cantidad_disponible: product.stock,
      foto_url: product.image,
      codigo_categoria: cat ? cat.codigo_categoria : null
    };
    
    const { data, error } = await supabase.from('productos').insert([dbProduct]).select();
    if (error) {
      console.error('Error adding product:', error);
      throw error;
    } else if (data) {
      setProductById(prev => ({ ...prev, [newId]: { ...product, id: newId } }));
    }
  };

  const updateProduct = async (id, updated) => {
    const dbProduct = {};
    if (updated.name !== undefined) dbProduct.nombre = updated.name;
    if (updated.price !== undefined) dbProduct.precio = updated.price;
    if (updated.stock !== undefined) dbProduct.cantidad_disponible = updated.stock;
    if (updated.image !== undefined) dbProduct.foto_url = updated.image;
    if (updated.category !== undefined) {
      const cat = rawCategories.find(c => c.nombre === updated.category);
      dbProduct.codigo_categoria = cat ? cat.codigo_categoria : null;
    }

    const { data, error } = await supabase.from('productos').update(dbProduct).eq('codigo_producto', id).select();
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    } else if (data) {
      setProductById(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...updated, id } }));
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('productos').delete().eq('codigo_producto', id);
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    } else {
      setProductById(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Funciones de Ventas
  const addSale = (sale) => setSales([...sales, { ...sale, id: Date.now() }]);

  // Funciones de Pedidos
  const addPedido = async (pedido) => {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select();
    if (error) {
      console.error('Error adding order to Supabase:', error);
      throw error;
    }
    if (data && data[0]) {
      setPedidos(prev => [data[0], ...prev]);
      return data[0];
    }
  };

  const updatePedidoEstado = async (id, estado) => {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select();
    if (error) {
      console.error('Error updating order state in Supabase:', error);
      throw error;
    }
    if (data && data[0]) {
      setPedidos(prev => prev.map(p => p.id === id ? data[0] : p));
      return data[0];
    }
  };

  // Funciones de Delivery
  const updateDeliveryPrice = async (newPrice) => {
    const price = Number(newPrice) || 0;
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave: 'delivery_price', valor: String(price), updated_at: new Date().toISOString() }, { onConflict: 'clave' });
    if (error) {
      console.error('Error saving delivery price:', error);
      throw error;
    }
    setDeliveryPrice(price);
  };

  const updateWhatsappNumber = async (newNumber) => {
    const cleanNumber = String(newNumber).replace(/\D/g, '');
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave: 'whatsapp_number', valor: cleanNumber, updated_at: new Date().toISOString() }, { onConflict: 'clave' });
    if (error) {
      console.error('Error saving whatsapp number:', error);
      throw error;
    }
    setWhatsappNumber(cleanNumber);
  };

  // Funciones de Arqueos
  const addArqueo = (arqueo) => setArqueos([...arqueos, { ...arqueo, id: Date.now() }]);
  const updateArqueoStatus = (id, status, notes) => setArqueos(arqueos.map(a => a.id === id ? { ...a, status, notes } : a));

  // Funciones de Usuarios
  const addUser = async (user) => {
    const uuid = user.id || crypto.randomUUID();
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        id: uuid,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null
      }])
      .select();

    if (error) {
      console.error('Error adding user:', error);
      throw error;
    } else if (data && data[0]) {
      setUsers([...users, data[0]]);
    }
  };

  const updateUser = async (id, updated) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    } else if (data && data[0]) {
      setUsers(users.map(u => u.id === id ? data[0] : u));
    }
  };

  const deleteUser = async (id) => {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    } else {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // Funciones de Theme
  const applyThemeToDocument = (colors) => {
    const root = document.documentElement;
    if (colors.primary) root.style.setProperty('--color-primary', colors.primary);
    if (colors.primaryContainer) root.style.setProperty('--color-primary-container', colors.primaryContainer);
    if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
  };

  const updateThemeColor = async (newColors) => {
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave: 'theme_colors', valor: JSON.stringify(newColors), updated_at: new Date().toISOString() }, { onConflict: 'clave' });
    if (error) {
      console.error('Error saving theme colors:', error);
      throw error;
    }
    setThemeColor(newColors);
    applyThemeToDocument(newColors);
  };

  // Funciones de Banners
  const addBanner = async (banner) => {
    const dbBanner = {
      name: banner.name,
      image: banner.image,
      active: banner.active
    };
    const { data, error } = await supabase.from('banners').insert([dbBanner]).select();
    if (error) {
      console.error('Error adding banner:', error);
      throw error;
    } else if (data && data[0]) {
      setBanners([...banners, {
        id: data[0].id,
        name: data[0].name,
        image: data[0].image,
        active: data[0].active
      }]);
    }
  };

  const updateBannerStatus = async (id) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    const nextActive = !banner.active;

    const { error } = await supabase
      .from('banners')
      .update({ active: nextActive })
      .eq('id', id);

    if (error) {
      console.error('Error updating banner status:', error);
      throw error;
    } else {
      setBanners(banners.map(b => b.id === id ? { ...b, active: nextActive } : b));
    }
  };

  const deleteBanner = async (id) => {
    const banner = banners.find(b => b.id === id);
    if (banner && banner.image) {
      try {
        const parts = banner.image.split('/storage/v1/object/public/banners/');
        if (parts.length > 1) {
          const fileName = decodeURIComponent(parts[1]).split('?')[0];
          const { error: storageError } = await supabase.storage
            .from('banners')
            .remove([fileName]);
          if (storageError) {
            console.warn('Advertencia al eliminar la imagen del storage:', storageError);
          }
        }
      } catch (storageErr) {
        console.error('Error al intentar eliminar la imagen del storage:', storageErr);
      }
    }

    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) {
      console.error('Error deleting banner:', error);
      throw error;
    } else {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  return (
    <AppContext.Provider value={{
      categories, rawCategories,
      fetchProductsPage,
      getProductById,
      addProduct, updateProduct, deleteProduct,
      sales, addSale,
      pedidos, addPedido, updatePedidoEstado,
      arqueos, addArqueo, updateArqueoStatus,
      users, addUser, updateUser, deleteUser,
      themeColor, updateThemeColor,
      banners, bannersReady, addBanner, updateBannerStatus, deleteBanner,
      globalSearchQuery, setGlobalSearchQuery,
      deliveryPrice, updateDeliveryPrice,
      whatsappNumber, updateWhatsappNumber,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
