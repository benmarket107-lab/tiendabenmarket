import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Phone, CheckCircle, Info } from 'lucide-react';

export default function WhatsAppConfig() {
  const { whatsappNumber, updateWhatsappNumber } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  useEffect(() => {
    if (whatsappNumber) {
      setInputValue(whatsappNumber);
    }
  }, [whatsappNumber]);

  const handleSave = async () => {
    const cleaned = inputValue.replace(/\D/g, '');
    if (cleaned.length < 8) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');
    try {
      await updateWhatsappNumber(cleaned);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-5 mb-6 border-l-4 border-l-[#25D366] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        
        {/* Ícono + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-3 bg-[#25D366]/10 rounded-xl text-[#25D366] shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface">Número de WhatsApp de Pedidos</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Los clientes enviarán sus carritos a este número de contacto.
            </p>
          </div>
        </div>

        {/* Input + Botón */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              className="input-field w-52 text-left font-mono pl-3 pr-3"
              placeholder="Ej: 595981123456"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'loading'}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={status === 'loading' || inputValue === ''}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
              status === 'success'
                ? 'bg-green-500 text-white'
                : status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-[#25D366] hover:bg-[#128C7E] text-white'
            }`}
          >
            {status === 'loading' ? (
              'Guardando...'
            ) : status === 'success' ? (
              <><CheckCircle className="w-4 h-4" /> Guardado</>
            ) : status === 'error' ? (
              'Error'
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 pl-1">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p>
            Ingresá el número con código de país incluido y sin espacios ni símbolos (Ejemplo para Paraguay: <span className="font-bold">595981123456</span>).
          </p>
        </div>
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-600 mt-2 pl-1">
          Asegúrate de ingresar un número válido (mínimo 8 dígitos) o verifica la conexión.
        </p>
      )}
    </div>
  );
}
