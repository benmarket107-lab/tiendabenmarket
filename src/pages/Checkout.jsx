import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, ArrowLeft, MessageCircle, ShoppingBag, MapPin, Phone, User, Link2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER;

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { deliveryPrice, whatsappNumber } = useAppContext();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombre: user?.name?.split(' ')[0] || '',
    apellido: user?.name?.split(' ').slice(1).join(' ') || '',
    telefono: '',
    direccion: '',
    barrio: '',
    google_maps: '',
    nota: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildWhatsAppMessage = () => {
    const clientName = `${formData.nombre} ${formData.apellido}`.trim();
    const address = [formData.direccion, formData.barrio, 'Ciudad del Este'].filter(Boolean).join(', ');
    const grandTotal = total + deliveryPrice;

    const itemLines = cart
      .map(item => `  • ${item.quantity}x ${item.name} → ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const message = [
      '🛒 *NUEVO PEDIDO - BenMarket*',
      '',
      `👤 *Cliente:* ${clientName}`,
      `📞 *Teléfono:* ${formData.telefono}`,
      `📍 *Dirección:* ${address}`,
      formData.google_maps ? `🗺️ *Ubicación:* ${formData.google_maps}` : null,
      formData.nota ? `📝 *Nota:* ${formData.nota}` : null,
      '',
      '🧾 *Detalle del pedido:*',
      itemLines,
      '',
      `🛋️ *Subtotal:* ${formatCurrency(total)}`,
      `🚴 *Delivery (Cde):* ${formatCurrency(deliveryPrice)}`,
      `💰 *TOTAL: ${formatCurrency(grandTotal)}*`,
      '',
      '_Pedido generado desde BenMarket Online_',
    ]
      .filter(line => line !== null)
      .join('\n');

    return message;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = buildWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const targetNumber = whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '595981000000';
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    clearCart();
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="relative inline-block mb-8">
          <div className="bg-green-100 p-8 rounded-full">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#25D366] p-3 rounded-full shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">¡Pedido enviado!</h2>
        <p className="text-slate-600 mb-2 text-lg">
          Tu pedido fue enviado a WhatsApp de BenMarket.
        </p>
        <p className="text-slate-500 mb-8 text-sm">
          Si no se abrió automáticamente, revisá que tu navegador no haya bloqueado la ventana emergente.
        </p>

        <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-5 mb-8 text-left">
          <p className="text-sm font-semibold text-[#1a9e4e] mb-1">¿Qué sigue?</p>
          <p className="text-sm text-slate-600">
            Un representante de BenMarket se pondrá en contacto con vos por WhatsApp para confirmar tu pedido y coordinar la entrega.
          </p>
        </div>

        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
        >
          <ArrowLeft className="w-5 h-5" /> Volver a la tienda
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/cart')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Volver al carrito"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finalizar Pedido</h1>
          <p className="text-sm text-slate-500">Completá tus datos y te contactaremos por WhatsApp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Formulario */}
        <div>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">

            {/* Datos personales */}
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-benmarket-600" />
              <h2 className="text-lg font-bold text-slate-800">Datos personales</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  name="nombre"
                  className="input-field"
                  placeholder="Ej: Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  name="apellido"
                  className="input-field"
                  placeholder="Ej: Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                Teléfono de contacto <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                name="telefono"
                className="input-field"
                placeholder="Ej: 0981 123 456"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            {/* Dirección de envío */}
            <div className="pt-2 flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-benmarket-600" />
              <h2 className="text-lg font-bold text-slate-800">Dirección de entrega</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Calle y número <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                name="direccion"
                className="input-field"
                placeholder="Ej: Av. Mcal. López 1234"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Barrio</label>
                <input
                  type="text"
                  name="barrio"
                  className="input-field"
                  placeholder="Ej: Villa Aurelia"
                  value={formData.barrio}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  readOnly
                  className="input-field bg-slate-100 text-slate-500 cursor-not-allowed"
                  value="Ciudad del Este"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Link2 className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                Link de Google Maps <span className="text-slate-400 font-normal text-xs">(opcional, para mayor precisión)</span>
              </label>
              <input
                type="url"
                name="google_maps"
                className="input-field"
                placeholder="Ej: https://maps.app.goo.gl/..."
                value={formData.google_maps}
                onChange={handleChange}
              />
              <p className="text-xs text-slate-400 mt-1">Abrí Google Maps, buscá tu ubicación, presioná "Compartir" y pegá el link aquí.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nota / Referencia adicional</label>
              <textarea
                name="nota"
                className="input-field resize-none h-20"
                placeholder="Ej: Dejar en portería, llamar al llegar..."
                value={formData.nota}
                onChange={handleChange}
              />
            </div>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div>
          <div className="card p-6 sticky top-24 bg-slate-50 border-benmarket-100">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-benmarket-600" />
              <h3 className="text-lg font-bold text-slate-900">Tu pedido</h3>
            </div>

            <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-slate-500 text-xs">{item.quantity} unid. × {formatCurrency(item.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6 space-y-2">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🚴 Delivery (Ciudad del Este)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(deliveryPrice)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-benmarket-600">{formatCurrency(total + deliveryPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
              </svg>
              Enviar pedido por WhatsApp
            </button>

            <p className="text-xs text-center text-slate-500 mt-3">
              Se abrirá WhatsApp con tu pedido listo para enviar a BenMarket
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}