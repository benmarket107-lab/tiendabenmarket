import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Edit, Trash2, X, Info, AlertTriangle, User } from 'lucide-react';

export default function UsersManager() {
  const { users, updateUser, deleteUser } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Cliente' });

  const handleOpenModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateUser(editingUser.id, formData);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Error al actualizar el usuario en la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esto no borrará sus credenciales de autenticación, pero sí su perfil de la tienda.')) {
      try {
        await deleteUser(id);
      } catch (err) {
        alert(err.message || 'Error al eliminar el usuario.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
      </div>

      {/* Banner Informativo sobre Supabase Auth */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex gap-3 text-blue-800">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-1">Flujo de registro y gestión:</p>
          <p>
            Por seguridad, las cuentas reales se administran a través de <strong>Supabase Auth</strong>. 
            Para agregar un nuevo usuario (Cajero, Tesorero, etc.), pídale que se registre en el formulario de la tienda 
            o mediante Google. Luego, búscquelo en esta lista y edite su rol para concederle los accesos correspondientes.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden shadow-sm border border-slate-100 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">
                    No se encontraron usuarios en la base de datos.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'Cajero' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'Tesoreria' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenModal(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-950">Editar Rol y Perfil</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email (Sólo lectura en perfil)</label>
                <input required readOnly type="email" className="input-field bg-slate-50 text-slate-500 cursor-not-allowed" value={formData.email} disabled={true} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Rol en la Tienda</label>
                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={loading}>
                  <option value="Cliente">Cliente</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Tesoreria">Tesorería</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg flex gap-2.5 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Modificar el rol cambiará instantáneamente los accesos de este usuario la próxima vez que navegue por la plataforma.</p>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" disabled={loading}>Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}