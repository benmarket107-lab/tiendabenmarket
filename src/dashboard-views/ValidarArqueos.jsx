import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ValidarArqueos() {
  const { arqueos, updateArqueoStatus } = useAppContext();
  const [selectedArqueo, setSelectedArqueo] = useState(null);
  const [observacion, setObservacion] = useState('');

  const handleValidar = (id, status) => {
    updateArqueoStatus(id, status, observacion);
    setSelectedArqueo(null);
    setObservacion('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Validación de Arqueos</h1>
      
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-semibold">Cajero</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold text-right">Sistema</th>
                <th className="p-4 font-semibold text-right">Declarado</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arqueos.map(arqueo => (
                <tr key={arqueo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{arqueo.cashierName}</td>
                  <td className="p-4 text-slate-600">{new Date(arqueo.date).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-slate-600">{formatCurrency(arqueo.systemAmount)}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900">{formatCurrency(arqueo.declaredAmount)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      arqueo.status === 'Aprobado' ? 'bg-green-100 text-green-700' : 
                      arqueo.status === 'Rechazado' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {arqueo.status === 'Con Diferencia' && <AlertTriangle className="w-3 h-3" />}
                      {arqueo.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedArqueo(arqueo)}
                      className="text-sm font-medium text-benmarket-600 hover:text-benmarket-800 hover:underline"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedArqueo && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Revisión de Arqueo</h3>
            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="flex justify-between text-sm"><span className="text-slate-500">Cajero:</span> <span className="font-medium">{selectedArqueo.cashierName}</span></p>
              <p className="flex justify-between text-sm"><span className="text-slate-500">Fecha:</span> <span className="font-medium">{new Date(selectedArqueo.date).toLocaleString()}</span></p>
              <div className="border-t border-slate-200 pt-2 mt-2">
                <p className="flex justify-between text-sm mb-1"><span className="text-slate-500">Total Sistema:</span> <span className="font-mono">{formatCurrency(selectedArqueo.systemAmount)}</span></p>
                <p className="flex justify-between text-sm"><span className="text-slate-500">Total Declarado:</span> <span className="font-mono font-bold">{formatCurrency(selectedArqueo.declaredAmount)}</span></p>
              </div>
              <p className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                <span>Diferencia:</span> 
                <span className={selectedArqueo.declaredAmount - selectedArqueo.systemAmount === 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(selectedArqueo.declaredAmount - selectedArqueo.systemAmount)}
                </span>
              </p>
              {selectedArqueo.notes && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Notas del cajero:</span>
                  <p className="text-sm italic text-slate-700">"{selectedArqueo.notes}"</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones de Tesorería (Opcional)</label>
              <textarea 
                className="input-field w-full" 
                rows="3" 
                placeholder="Escribe un comentario..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelectedArqueo(null)} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleValidar(selectedArqueo.id, 'Rechazado')} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1">
                <X className="w-4 h-4" /> Rechazar
              </button>
              <button onClick={() => handleValidar(selectedArqueo.id, 'Aprobado')} className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 flex items-center gap-1">
                <Check className="w-4 h-4" /> Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}