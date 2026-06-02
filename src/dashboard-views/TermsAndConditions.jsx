import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingBag, Truck, CreditCard, AlertCircle, Scale } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FileText className="w-10 h-10 text-primary" />
          Términos y Condiciones
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Última actualización: {new Date().toLocaleDateString('es-PY')}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 space-y-10">
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Scale className="w-6 h-6 text-benmarket-500" />
            1. Aceptación de los Términos
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Al acceder y utilizar la plataforma web de BenMarket, aceptas estar sujeto a los siguientes Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, te solicitamos no utilizar nuestros servicios.</p>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento, y es responsabilidad del usuario revisarlos periódicamente.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-benmarket-500" />
            2. Compras y Disponibilidad de Productos
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Todos los pedidos realizados a través de nuestra web están sujetos a disponibilidad de stock en el momento de la preparación del pedido.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Nos esforzamos por mantener nuestro inventario digital lo más actualizado posible, sin embargo, en casos excepcionales de quiebre de stock, nos comunicaremos contigo para ofrecerte un reemplazo o ajustar el pedido.</li>
              <li>Las imágenes de los productos son de carácter ilustrativo y pueden variar ligeramente del empaque real.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Truck className="w-6 h-6 text-benmarket-500" />
            3. Envíos y Zonas de Cobertura
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Actualmente, nuestro servicio de entrega a domicilio (delivery) opera exclusivamente en la zona de <strong>Ciudad del Este</strong> y alrededores.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>El costo del delivery será calculado y sumado al total de tu compra antes de finalizar el pedido.</li>
              <li>Para entregas fuera del área principal, por favor consulta la factibilidad a través de nuestro canal de WhatsApp.</li>
              <li>También ofrecemos la opción de "Retiro en Tienda" sin costo adicional.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-benmarket-500" />
            4. Precios y Pagos
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Todos los precios publicados en BenMarket están expresados en Guaraníes (Gs.) e incluyen el Impuesto al Valor Agregado (IVA).</p>
            <p>Una vez finalizado el pedido en la web, serás redirigido a WhatsApp, donde nuestro equipo de atención al cliente confirmará tu pedido y coordinará el método de pago (transferencia bancaria, código QR, efectivo al momento de la entrega o tarjeta mediante POS móvil, según disponibilidad).</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-benmarket-500" />
            5. Cambios y Devoluciones
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Debido a la naturaleza de los productos que comercializamos (alimentos, bebidas, perecederos), las políticas de cambio son estrictas para garantizar la inocuidad y calidad:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Productos perecederos:</strong> Deben ser revisados al momento de la entrega. No se aceptan devoluciones posteriores una vez recibido el producto conforme.</li>
              <li><strong>Productos no perecederos:</strong> Solo se aceptarán cambios dentro de las 24 horas posteriores a la compra si el producto presenta fallas de fábrica y conserva su empaque original sin abrir.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}