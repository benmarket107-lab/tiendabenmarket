'use client';

import { useState } from 'react';
import ClientesModal from '../components/ClientesModal';
import { Users, Sparkles, Send, Download } from 'lucide-react';

export default function ClientesManager() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-headline">
              Clientes & Newsletter
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Base de datos unificada de clientes para envíos de promociones por WhatsApp y correo electrónico.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Abrir Panel de Clientes & Promociones</span>
        </button>
      </div>

      {/* Modal montado */}
      <ClientesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
