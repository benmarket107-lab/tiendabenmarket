import React, { useState, useEffect } from 'react';
import { Palette, CheckCircle, Save, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ThemeManager() {
  const { themeColor, updateThemeColor } = useAppContext();
  
  const [colors, setColors] = useState({
    primary: '#b9080c',
    primaryContainer: '#d0090e',
    secondary: '#a83544'
  });

  const [status, setStatus] = useState('idle');

  // Sincronizar el estado local cuando el contexto cargue
  useEffect(() => {
    if (themeColor) {
      setColors({
        primary: themeColor.primary || '#b9080c',
        primaryContainer: themeColor.primaryContainer || '#d0090e',
        secondary: themeColor.secondary || '#a83544'
      });
    }
  }, [themeColor]);

  const handleChange = (e) => {
    setColors({ ...colors, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await updateThemeColor(colors);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    setColors({
      primary: '#b9080c',
      primaryContainer: '#d0090e',
      secondary: '#a83544'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Personalización de Marca</h1>
        <p className="text-slate-500 text-sm mt-1">Configura la paleta de colores principal de la plataforma Benmarket.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Colores Globales</h3>
            <p className="text-sm text-slate-500">Estos colores se aplicarán a botones, menús, textos destacados y elementos interactivos.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Color Principal (Primary)</label>
              <p className="text-xs text-slate-500 mb-2">Usado en botones primarios, iconos y encabezados.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="primary"
                  value={colors.primary}
                  onChange={handleChange}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  name="primary"
                  value={colors.primary.toUpperCase()}
                  onChange={handleChange}
                  className="input-field uppercase font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Color Secundario (Secondary)</label>
              <p className="text-xs text-slate-500 mb-2">Usado en elementos secundarios e interacciones sutiles.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="secondary"
                  value={colors.secondary}
                  onChange={handleChange}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  name="secondary"
                  value={colors.secondary.toUpperCase()}
                  onChange={handleChange}
                  className="input-field uppercase font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Color Contenedor Principal</label>
              <p className="text-xs text-slate-500 mb-2">Usado en efectos hover y variaciones oscuras del color primario.</p>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  name="primaryContainer"
                  value={colors.primaryContainer}
                  onChange={handleChange}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  name="primaryContainer"
                  value={colors.primaryContainer.toUpperCase()}
                  onChange={handleChange}
                  className="input-field uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button 
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Restaurar Originales
            </button>
            
            <button 
              type="submit"
              disabled={status === 'loading'}
              className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                status === 'success' ? 'bg-green-500 text-white hover:bg-green-600' :
                status === 'error' ? 'bg-red-500 text-white hover:bg-red-600' :
                'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {status === 'loading' ? 'Aplicando...' :
               status === 'success' ? <><CheckCircle className="w-4 h-4" /> Aplicado</> :
               status === 'error' ? 'Error al guardar' :
               <><Save className="w-4 h-4" /> Guardar y Aplicar</>}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-2xl text-blue-800 text-sm">
        <strong>Nota:</strong> Los cambios de color se aplicarán inmediatamente en toda la página para ti, pero los demás usuarios podrían necesitar recargar la página para ver los nuevos colores de la marca.
      </div>
    </div>
  );
}
