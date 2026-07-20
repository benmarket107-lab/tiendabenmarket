'use client';

import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useAppContext } from '../../../context/AppContext';
import { ArrowLeft, ShoppingBag, MapPin, Phone, User, Link2, Truck, Store } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

export default function CheckoutPage() {
  const { cart, total, clearCart, shippingMethod, setShippingMethod } = useCart();
  const { user } = useAuth();
  const { deliveryPrice, whatsappNumber, addPedido } = useAppContext();
  const router = useRouter();

  const finalDeliveryPrice = shippingMethod === 'pickup' ? 0 : deliveryPrice;
  const grandTotal = total + finalDeliveryPrice;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const [formData, setFormData] = useState({
    nombre: user?.user_metadata?.nombre || user?.nombre || user?.name?.split(' ')[0] || '',
    apellido: user?.user_metadata?.apellido || user?.apellido || user?.name?.split(' ').slice(1).join(' ') || '',
    telefono: user?.user_metadata?.telefono || user?.telefono || '',
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
    const isPickup = shippingMethod === 'pickup';
    const address = isPickup 
      ? '🏪 Retiro en Tienda' 
      : [formData.direccion, formData.barrio, 'Ciudad del Este'].filter(Boolean).join(', ');
    const finalDeliveryPrice = isPickup ? 0 : deliveryPrice;
    const currentGrandTotal = total + finalDeliveryPrice;

    const itemLines = cart
      .map(item => {
        let line = `  • ${item.quantity}x ${item.name} (${formatCurrency(item.price)} c/u) → ${formatCurrency(item.price * item.quantity)}\n    _Cód: ${item.id}_`;
        if (typeof window !== 'undefined') {
          line += `\n    🔗 _Ver producto:_ ${window.location.origin}/product/${encodeURIComponent(item.id)}`;
        }
        return line;
      })
      .join('\n\n');

    const message = [
      '🛒 *NUEVO PEDIDO - BenMarket*',
      '',
      `👤 *Cliente:* ${clientName}`,
      `📞 *Teléfono:* ${formData.telefono}`,
      isPickup ? `🏪 *Método:* Retiro en Tienda` : `📍 *Dirección:* ${address}`,
      (!isPickup && formData.google_maps) ? `🗺️ *Ubicación:* ${formData.google_maps}` : null,
      formData.nota ? `📝 *Nota:* ${formData.nota}` : null,
      '',
      '🧾 *Detalle del pedido:*',
      itemLines,
      '',
      `🛋️ *Subtotal:* ${formatCurrency(total)}`,
      isPickup 
        ? `🏪 *Retiro en Tienda:* ${formatCurrency(0)}` 
        : (deliveryPrice === 0 
            ? `🚴 *Envio (CDE):* El precio del delivery será enviado al confirmar el pedido.` 
            : `🚴 *Delivery (Cde):* ${formatCurrency(deliveryPrice)}`),
      `💰 *TOTAL: ${formatCurrency(currentGrandTotal)}*`,
      '',
      '_Pedido generado desde BenMarket Online_',
    ]
      .filter(line => line !== null)
      .join('\n');

    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isPickup = shippingMethod === 'pickup';
      const finalDeliveryPrice = isPickup ? 0 : deliveryPrice;
      const pedido = {
        cliente_nombre: `${formData.nombre} ${formData.apellido}`.trim(),
        cliente_telefono: formData.telefono,
        cliente_direccion: isPickup ? 'Retiro en Tienda' : formData.direccion,
        cliente_barrio: isPickup ? null : (formData.barrio || null),
        cliente_google_maps: isPickup ? null : (formData.google_maps || null),
        cliente_nota: formData.nota || null,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: total,
        delivery: finalDeliveryPrice,
        total: total + finalDeliveryPrice,
        estado: 'Pendiente',
        user_id: user?.id || null
      };

      await addPedido(pedido);

      const message = buildWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      const targetNumber = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '595981000000';
      const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
      
      setIsRedirecting(true);
      clearCart();
      window.location.href = whatsappUrl;
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Hubo un error al procesar tu pedido en el sistema. De todos modos podés enviarlo manualmente por WhatsApp.");
      
      const message = buildWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      const targetNumber = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '595981000000';
      const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
      
      setIsRedirecting(true);
      clearCart();
      window.location.href = whatsappUrl;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-in">
        <div className="w-16 h-16 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Pedido registrado con éxito!</h2>
        <p className="text-slate-600">Redirigiéndote a WhatsApp para enviar el pedido...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <button
          onClick={() => router.push('/cart')}
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

      {/* Mobile-only Collapsible Order Summary */}
      <div className="mb-6 md:hidden">
        <button
          type="button"
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="font-bold text-slate-800 text-sm">Resumen del pedido</span>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-slate-900">{formatCurrency(grandTotal)}</span>
            <span className="text-xs text-slate-400 font-bold">{isSummaryExpanded ? 'Ocultar' : 'Mostrar'}</span>
          </div>
        </button>

        {isSummaryExpanded && (
          <div className="mt-2 p-4 bg-white border border-slate-150 rounded-2xl space-y-3 max-h-60 overflow-y-auto shadow-sm animate-in slide-in-from-top duration-200">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-100 p-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-slate-400 text-[10px]">{item.quantity} unid. × {formatCurrency(item.price)}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3 mt-2 space-y-1.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {shippingMethod === 'delivery' && deliveryPrice === 0 ? (
                <div className="flex flex-col gap-0.5 mt-1 border-t border-dashed border-slate-100 pt-1.5">
                  <div className="flex justify-between">
                    <span>🚴 Envio (CDE)</span>
                    <span className="text-amber-600 font-bold">A confirmar</span>
                  </div>
                  <p className="text-[10px] text-amber-600 font-normal leading-tight text-right">
                    El precio del delivery será enviado al confirmar el pedido.
                  </p>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>{shippingMethod === 'pickup' ? '🏪 Retiro en Tienda' : '🚴 Delivery'}</span>
                  <span>{formatCurrency(finalDeliveryPrice)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Formulario */}
        <div className="card p-6 md:p-8 bg-white shadow-sm border border-slate-100">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Datos personales */}
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-800">Datos personales</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
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
            {shippingMethod === 'delivery' ? (
              <>
                <hr className="border-slate-100 my-6" />
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-primary" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
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
              </>
            ) : (
              <>
                <hr className="border-slate-100 my-6" />
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary mt-0.5 shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Retiro en local BenMarket</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Podés pasar a retirar tu pedido en nuestro local de Ciudad del Este.
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1">
                        Horario de atención: Lunes a Sábados de 08:00 a 18:00 hs.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <hr className="border-slate-100 my-6" />
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
          <div className="card p-6 sticky top-24 bg-slate-50 border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-900">Tu pedido</h3>
            </div>

            {/* Selector de Método de Entrega */}
            <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 mb-5">
              <button
                type="button"
                onClick={() => setShippingMethod('delivery')}
                className={`flex-grow flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                  shippingMethod === 'delivery'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setShippingMethod('pickup')}
                className={`flex-grow flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                  shippingMethod === 'pickup'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retiro en Tienda</span>
              </button>
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
              {shippingMethod === 'delivery' && deliveryPrice === 0 ? (
                <div className="flex flex-col gap-0.5 mt-1 border-t border-dashed border-slate-200 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">🚴 Envio (CDE)</span>
                    <span className="font-semibold text-amber-600">A confirmar</span>
                  </div>
                  <p className="text-xs text-amber-600 font-normal leading-normal text-right">
                    El precio del delivery será enviado al confirmar el pedido.
                  </p>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {shippingMethod === 'pickup' ? '🏪 Retiro en Tienda' : '🚴 Delivery (Ciudad del Este)'}
                  </span>
                  <span className="font-semibold text-slate-800">{formatCurrency(finalDeliveryPrice)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
              </svg>
              {isSubmitting ? 'Procesando...' : 'Enviar pedido por WhatsApp'}
            </button>

            <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto">
              Al confirmar, tu pedido se registrará y serás redirigido automáticamente a WhatsApp para enviarlo. Un funcionario confirmará tu entrega y te proveerá el QR de pago.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
