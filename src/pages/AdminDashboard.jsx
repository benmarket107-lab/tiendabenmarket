import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, ShoppingBag, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const { sales, users, addSale, fetchProductsPage } = useAppContext();
  const [activeProducts, setActiveProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = sales.length;
  const lowStockCount = lowStockProducts.length;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const { count, error } = await supabase
          .from('productos')
          .select('codigo_producto', { count: 'estimated', head: true })
          .gt('cantidad_disponible', 0);

        if (!cancelled && !error) {
          setActiveProducts(Number(count) || 0);
        }
      } catch (e) {
        if (!cancelled) setActiveProducts(0);
      }

      try {
        const { data, error } = await supabase
          .from('productos')
          .select('codigo_producto,nombre,precio,cantidad_disponible,foto_url')
          .lte('cantidad_disponible', 9)
          .order('cantidad_disponible', { ascending: true })
          .limit(6);

        if (!cancelled && !error) {
          setLowStockProducts(
            (data || []).map(p => ({
              id: p.codigo_producto,
              name: p.nombre,
              price: p.precio,
              stock: p.cantidad_disponible,
              image: p.foto_url || null,
            }))
          );
        }
      } catch (e) {
        if (!cancelled) setLowStockProducts([]);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerateRandomSale = async () => {
    try {
      const { items } = await fetchProductsPage({ page: 1, pageSize: 25 });
      const randomProduct = items[Math.floor(Math.random() * items.length)];
      if (!randomProduct) return;

      const qty = Math.floor(Math.random() * 3) + 1;
      const sale = {
        cashierId: 2,
        cashierName: 'María Cajera',
        total: randomProduct.price * qty,
        date: new Date().toISOString(),
        items: [{ productId: randomProduct.id, qty, price: randomProduct.price, name: randomProduct.name }],
        type: Math.random() > 0.5 ? 'Online' : 'Presencial'
      };
      addSale(sale);
    } catch (e) {
    }
  };

  const statCards = [
    { title: 'Ventas Totales', value: formatCurrency(totalSales), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pedidos', value: totalOrders, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Usuarios', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Productos Activos', value: activeProducts, icon: ShoppingBag, color: 'text-benmarket-600', bg: 'bg-benmarket-100' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Global</h1>
        
        {/* Botón de Pruebas Rápidas para Admin */}
        <button 
          onClick={handleGenerateRandomSale}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors text-sm"
          title="Generar una venta aleatoria para probar gráficos y tablas"
        >
          <Zap className="w-4 h-4" /> Generar Venta de Prueba
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-6 flex items-center gap-4 border-transparent hover:border-slate-200 transition-colors">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Últimas Ventas</h2>
          </div>
          <div className="space-y-4">
            {sales.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No hay ventas registradas aún.</div>
            ) : (
              sales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Venta #{sale.id || Math.floor(Math.random()*1000)}</p>
                      <p className="text-xs font-medium text-slate-500">{new Date(sale.date).toLocaleString()} • {sale.type || 'Presencial'}</p>
                    </div>
                  </div>
                  <span className="font-black text-lg text-benmarket-600">{formatCurrency(sale.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Productos con Bajo Stock</h2>
            <Link to="/dashboard/products" className="text-sm text-benmarket-600 font-bold hover:underline">Gestionar</Link>
          </div>
          <div className="space-y-4">
            {lowStockCount === 0 ? (
              <div className="text-center py-8 text-slate-400">Todos los productos tienen buen stock.</div>
            ) : (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-200" />
                    )}
                    <p className="font-bold text-slate-900">{product.name}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${product.stock === 0 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                    {product.stock} en stock
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
