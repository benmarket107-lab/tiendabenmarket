import { useAppContext } from '../context/AppContext';
import { TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '../utils/currency';

export default function TesoreriaDashboard() {
  const { sales, arqueos } = useAppContext();

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalArqueos = arqueos.length;
  const arqueosConDiferencia = arqueos.filter(a => a.status === 'Con Diferencia').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Resumen de Tesorería</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 bg-white border-l-4 border-benmarket-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Flujo de Efectivo Total</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(totalSales)}</h3>
            </div>
            <div className="p-3 bg-benmarket-50 rounded-lg text-benmarket-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-white border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Arqueos Registrados</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalArqueos}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-white border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Arqueos con Diferencias</p>
              <h3 className="text-3xl font-bold text-slate-900">{arqueosConDiferencia}</h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">Últimos Arqueos Recibidos</h2>
          <Link href="/dashboard/validations" className="text-sm text-benmarket-600 font-medium hover:underline">Ver todos</Link>
        </div>
        
        <div className="space-y-4">
          {arqueos.slice(0, 3).map(arqueo => (
            <div key={arqueo.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">{arqueo.cashierName}</p>
                <p className="text-xs text-slate-500">{new Date(arqueo.date).toLocaleString()}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-bold text-slate-900">{formatCurrency(arqueo.declaredAmount)}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  arqueo.status === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {arqueo.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}