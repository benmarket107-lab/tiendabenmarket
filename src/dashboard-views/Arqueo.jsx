import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Save } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function Arqueo() {
  const { sales, addArqueo } = useAppContext();
  const { user } = useAuth();
  
  // Calcular total vendido en el sistema para este cajero (simulación simple del turno actual)
  const mySales = sales.filter(s => s.cashierId === user.id);
  const systemTotal = mySales.reduce((sum, sale) => sum + sale.total, 0);

  const [declaredAmount, setDeclaredAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(declaredAmount);
    
    let status = 'Aprobado';
    let notes = '';
    
    if (amount !== systemTotal) {
      status = 'Con Diferencia';
      const diff = amount - systemTotal;
      notes = diff > 0 ? `Sobra ${formatCurrency(diff)}` : `Falta ${formatCurrency(Math.abs(diff))}`;
    }

    const arqueo = {
      cashierId: user.id,
      cashierName: user.name,
      date: new Date().toISOString(),
      declaredAmount: amount,
      systemAmount: systemTotal,
      status,
      notes
    };

    addArqueo(arqueo);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto mt-10">
        <div className="bg-green-100 text-green-600 p-4 rounded-full inline-block mb-4">
          <Save className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Arqueo Registrado</h2>
        <p className="text-slate-600 mb-6">Tu cierre de caja ha sido enviado a Tesorería exitosamente.</p>
        <button onClick={() => {setSubmitted(false); setDeclaredAmount('');}} className="btn-secondary">
          Realizar otro arqueo (Test)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-benmarket-100 text-benmarket-600 p-3 rounded-lg">
          <DollarSign className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Arqueo de Caja</h1>
      </div>

      <div className="card p-6 mb-6 bg-slate-800 text-white">
        <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-1">Total Registrado en Sistema</h2>
        <p className="text-4xl font-bold">{formatCurrency(systemTotal)}</p>
        <p className="text-sm text-slate-400 mt-2">Corresponde a {mySales.length} ventas registradas en tu turno.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Declaración de Efectivo</h3>
        <p className="text-sm text-slate-600 mb-6">Ingresa el monto total de efectivo contado en tu caja al finalizar el turno.</p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Efectivo Total Contado (PYG)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm font-bold">₲</span>
            </div>
            <input
              type="number"
              min="0"
              required
              value={declaredAmount}
              onChange={(e) => setDeclaredAmount(e.target.value)}
              className="input-field pl-8 text-lg font-medium"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Asegúrate de contar todos los billetes y monedas. Cualquier diferencia será reportada a Tesorería.
              </p>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3 text-lg">
          Enviar Arqueo a Tesorería
        </button>
      </form>
    </div>
  );
}