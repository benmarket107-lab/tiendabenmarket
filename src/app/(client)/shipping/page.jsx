import { Truck, Clock, MapPin, Package, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Envíos y Entregas | Benmarket Express',
  description: 'Conoce los métodos, costos y zonas de cobertura de entrega para tus compras en Benmarket Express.',
};

export default function ShippingPage() {
  return (
    <div className="w-full bg-surface min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mb-20 md:mb-0">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-black text-on-surface mb-4 tracking-tight">
            Envíos y <span className="text-primary">Entregas</span>
          </h1>
          <p className="text-on-surface-variant text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Te llevamos la frescura de Benmarket directo a tu puerta. Conoce cómo funcionan nuestros envíos.
          </p>
        </div>

        {/* Tarjetas de Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 sm:mb-16">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-on-surface">Envío Express</h3>
            <p className="text-on-surface-variant text-sm">Entregas en menos de 2 horas para pedidos dentro del área céntrica de Ciudad del Este.</p>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-on-surface">Horarios Flexibles</h3>
            <p className="text-on-surface-variant text-sm">Repartimos de Lunes a Sábados de 07:00 a 22:00 hrs. Domingos de 08:00 a 14:00 hrs.</p>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-on-surface">Cuidado Garantizado</h3>
            <p className="text-on-surface-variant text-sm">Tus productos frescos y frágiles viajan en compartimientos especiales para mantener su calidad.</p>
          </div>
        </div>

        {/* Detalles y Zonas */}
        <div className="space-y-8">
          
          {/* Costos de Envío */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="bg-surface-container-low p-4 rounded-2xl shrink-0">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mb-2">Costos de Envío</h2>
              <p className="text-on-surface-variant mb-4">
                El costo de envío varía según la distancia desde nuestra tienda física (Av. Julio Cesar Riquelme, km 7).
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <strong>Zona 1 (Hasta 3 km):</strong> Gs. 10.000
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <strong>Zona 2 (De 3 km a 7 km):</strong> Gs. 15.000
                </li>
                <li className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <strong>Zona 3 (Más de 7 km):</strong> Gs. 20.000+ (Consultar)
                </li>
              </ul>
            </div>
          </div>

          {/* Zonas de Cobertura */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="bg-surface-container-low p-4 rounded-2xl shrink-0">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface mb-2">Zonas de Cobertura</h2>
              <p className="text-on-surface-variant">
                Actualmente realizamos entregas en todo Ciudad del Este. Si te encuentras fuera de esta zona, por favor comunícate con nuestro servicio de atención al cliente antes de realizar tu pedido para coordinar la factibilidad de entrega.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
