export const users = [
  { id: 1, name: "Juan Cliente", email: "cliente@benmarket.com", password: "123", role: "Cliente", avatar: null },
  { id: 2, name: "María Cajera", email: "cajero@benmarket.com", password: "123", role: "Cajero", avatar: null },
  { id: 3, name: "Carlos Tesorero", email: "tesoreria@benmarket.com", password: "123", role: "Tesoreria", avatar: null },
  { id: 4, name: "Ana Admin", email: "admin@benmarket.com", password: "123", role: "Admin", avatar: null },
  { id: 5, name: "Pedro Invitado", email: "invitado@benmarket.com", password: "123", role: "Cliente", avatar: null },
];

export const categories = ["Bebidas", "Snacks", "Lácteos", "Limpieza", "Despensa", "Frescos"];

export const products = [
  { id: 1, name: "Coca Cola Original 2L", price: 15000, category: "Bebidas", stock: 50, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80" },
  { id: 2, name: "Agua Mineral Natural 1L", price: 5000, category: "Bebidas", stock: 100, image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&q=80" },
  { id: 3, name: "Papas Fritas Clásicas", price: 12000, category: "Snacks", stock: 30, image: "https://images.unsplash.com/photo-1566478989037-e924e5020a1e?w=500&q=80" },
  { id: 4, name: "Leche Entera Larga Vida 1L", price: 7500, category: "Lácteos", stock: 40, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80" },
  { id: 5, name: "Detergente Multiuso 500ml", price: 18000, category: "Limpieza", stock: 20, image: "https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=500&q=80" },
  { id: 6, name: "Arroz Blanco Grano Largo 1kg", price: 8500, category: "Despensa", stock: 60, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80" },
  { id: 7, name: "Manzanas Rojas Premium (kg)", price: 14000, category: "Frescos", stock: 15, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=500&q=80" },
  { id: 8, name: "Café Molido Tostado 250g", price: 25000, category: "Despensa", stock: 25, image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80" },
  { id: 9, name: "Galletas de Chocolate", price: 9000, category: "Snacks", stock: 45, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80" },
  { id: 10, name: "Jugo de Naranja 1L", price: 13500, category: "Bebidas", stock: 0, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80" },
];

export const sales = [
  { id: 101, cashierId: 2, total: 32000, date: "2023-10-25T10:30:00", items: [{ productId: 1, qty: 1 }, { productId: 3, qty: 1 }, { productId: 2, qty: 1 }] },
  { id: 102, cashierId: 2, total: 7500, date: "2023-10-25T11:15:00", items: [{ productId: 4, qty: 1 }] },
];

export const cashReconciliations = [ // Arqueos de caja
  { id: 1, cashierId: 2, cashierName: "María Cajera", date: "2023-10-24T18:00:00", declaredAmount: 1500000, systemAmount: 1500000, status: "Aprobado" },
  { id: 2, cashierId: 2, cashierName: "María Cajera", date: "2023-10-25T18:00:00", declaredAmount: 1450000, systemAmount: 1500000, status: "Con Diferencia", notes: "Faltan 50.000" },
];