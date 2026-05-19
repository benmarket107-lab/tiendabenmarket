import { createContext, useState, useContext, useEffect } from 'react';
import { sales as mockSales, cashReconciliations as mockArqueos } from '../data/mock';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState(mockSales);
  const [arqueos, setArqueos] = useState(mockArqueos);
  const [users, setUsers] = useState([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [themeColor, setThemeColor] = useState(null);

  const [categories, setCategories] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [banners, setBanners] = useState([
    { id: 1, name: 'Banner Principal Web', image: '/src/images/tienda.jpg', active: true },
    { id: 2, name: 'Promo Fin de Semana', image: '/src/images/banner.png', active: true },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Banners
      const { data: bannerData, error: bannerError } = await supabase
        .from('banners')
        .select('*')
        .order('id', { ascending: true });
      
      if (bannerError) {
        console.error('Error fetching banners:', bannerError);
      } else if (bannerData && bannerData.length > 0) {
        setBanners(bannerData.map(b => ({
          id: b.id,
          name: b.name,
          image: b.image,
          active: b.active
        })));
      }

      // Fetch Theme Colors
      const { data: themeData, error: themeError } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'theme_colors')
        .single();
      
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
        .single();
      if (!configError && configData) {
        setDeliveryPrice(Number(configData.valor) || 0);
      }

      // Fetch whatsapp number from configuracion table
      const { data: waData, error: waError } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'whatsapp_number')
        .single();
      if (!waError && waData) {
        setWhatsappNumber(waData.valor || '');
      } else {
        setWhatsappNumber(import.meta.env.VITE_WHATSAPP_NUMBER || '595981000000');
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

      // Fetch Categories
      const { data: catData, error: catError } = await supabase.from('categorias').select('*');
      if (catError) {
        console.error('Error fetching categories:', catError);
      } else {
        setRawCategories(catData || []);
        const mappedCategories = (catData || []).map(c => c.nombre);
        setCategories(mappedCategories);
      }

      // Fetch Products with category names (Paginated to bypass 1000 limit)
      let allProducts = [];
      let keepFetching = true;
      let start = 0;
      const limit = 1000;

      while (keepFetching) {
        const { data: prodData, error: prodError } = await supabase
          .from('productos')
          .select('*, categorias(nombre)')
          .range(start, start + limit - 1);

        if (prodError) {
          console.error('Error fetching products:', prodError);
          break;
        }

        if (prodData) {
          allProducts = [...allProducts, ...prodData];
          if (prodData.length < limit) {
            keepFetching = false;
          } else {
            start += limit;
          }
        } else {
          keepFetching = false;
        }
      }

      const mappedProducts = allProducts.map(p => ({
        id: p.codigo_producto,
        name: p.nombre,
        price: p.precio,
        stock: p.cantidad_disponible,
        image: p.foto_url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Sin+Imagen',
        category: p.categorias?.nombre || p.codigo_categoria || 'Sin Categoría'
      }));
      setProducts(mappedProducts);
    };
    fetchData();
  }, []);

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
      setProducts([...products, { ...product, id: newId }]);
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
      setProducts(products.map(p => p.id === id ? { ...p, ...updated } : p));
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('productos').delete().eq('codigo_producto', id);
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    } else {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Funciones de Ventas
  const addSale = (sale) => setSales([...sales, { ...sale, id: Date.now() }]);

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
        avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
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
      products, addProduct, updateProduct, deleteProduct,
      categories,
      sales, addSale,
      arqueos, addArqueo, updateArqueoStatus,
      users, addUser, updateUser, deleteUser,
      themeColor, updateThemeColor,
      banners, addBanner, updateBannerStatus, deleteBanner,
      globalSearchQuery, setGlobalSearchQuery,
      deliveryPrice, updateDeliveryPrice,
      whatsappNumber, updateWhatsappNumber,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);