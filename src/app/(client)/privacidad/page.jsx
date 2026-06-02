import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Bell } from 'lucide-react';

export const metadata = {
  title: 'Políticas de Privacidad | Benmarket Express',
  description: 'Conoce nuestras políticas de privacidad y cómo protegemos tus datos en Benmarket Express.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-primary" />
          Políticas de Privacidad
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Última actualización: {new Date().toLocaleDateString('es-PY')}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 space-y-10">
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-benmarket-500" />
            1. Información que recopilamos
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>En BenMarket, recopilamos la información estrictamente necesaria para poder procesar tus pedidos y brindarte la mejor experiencia de compra. Esta información incluye:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Datos de contacto:</strong> Nombre, apellido, número de teléfono (WhatsApp) y correo electrónico.</li>
              <li><strong>Datos de envío:</strong> Dirección de entrega, barrio, ciudad (Ciudad del Este y alrededores), y enlaces de ubicación (Google Maps).</li>
              <li><strong>Datos de navegación:</strong> Historial de compras y productos agregados a "Mis Favoritos".</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-benmarket-500" />
            2. Cómo utilizamos tu información
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>La información que nos proporcionas se utiliza exclusivamente para los siguientes fines:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Procesar, preparar y enviar tus pedidos a la dirección indicada.</li>
              <li>Comunicarnos contigo a través de WhatsApp para confirmar detalles del pedido o coordinar la entrega.</li>
              <li>Permitirte gestionar tu historial de pedidos (Mis Pedidos) y guardar tus productos favoritos.</li>
              <li>Mejorar nuestra plataforma y personalizar tu experiencia de usuario.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-benmarket-500" />
            3. Protección y Seguridad de Datos
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Tu privacidad es nuestra prioridad. BenMarket implementa medidas de seguridad técnicas y organizativas para proteger tus datos personales contra accesos no autorizados, alteraciones o destrucción.</p>
            <p>Toda la información se almacena de forma segura en nuestros servidores (gestionados a través de Supabase) bajo estrictos protocolos de encriptación y autenticación.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-benmarket-500" />
            4. Compartir información con terceros
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p><strong>BenMarket no vende, alquila ni comercializa tus datos personales con terceros.</strong></p>
            <p>Solo compartimos la información estrictamente necesaria (como tu nombre, dirección y número de teléfono) con nuestro equipo de logística y repartidores asignados para garantizar que tu pedido llegue a destino de manera eficiente.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-benmarket-500" />
            5. Tus Derechos
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed">
            <p>Como usuario de BenMarket, tienes derecho a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Acceder a la información personal que tenemos sobre ti.</li>
              <li>Modificar o actualizar tus datos en caso de que sean inexactos (por ejemplo, al realizar un nuevo pedido).</li>
              <li>Ocultar o eliminar el historial de tus pedidos desde tu panel de usuario.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
