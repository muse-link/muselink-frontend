import React, { useState, useEffect } from 'react';
import { User, MusicRequest, Transaction, SystemConfig } from '../types';
import { 
  getAllUsers, 
  getRequests, 
  getTransactions, 
  getSystemConfig, 
  saveSystemConfig,
  exportDatabase
} from '../services/storage';
import { InvoiceModal } from './InvoiceModal';
import { 
  Users, 
  Music, 
  DollarSign, 
  Settings, 
  FileText, 
  Save, 
  TrendingUp,
  Database,
  Download
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ creditPrice: 0 });
  
  const [activeTab, setActiveTab] = useState<'stats' | 'config' | 'invoices' | 'db'>('stats');
  const [newPrice, setNewPrice] = useState<string>('');
  
  // Invoice Viewer State
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(getAllUsers());
    setRequests(getRequests());
    setTransactions(getTransactions().sort((a, b) => b.date - a.date)); // Newest first
    const sysConfig = getSystemConfig();
    setConfig(sysConfig);
    setNewPrice(sysConfig.creditPrice.toString());
  };

  const handleUpdatePrice = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      alert("Por favor ingresa un precio válido.");
      return;
    }
    saveSystemConfig({ ...config, creditPrice: price });
    refreshData();
    alert("Precio del crédito actualizado correctamente.");
  };

  const handleDownloadBackup = () => {
    const json = exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muselink_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.cost, 0);
  const clientCount = users.filter(u => u.role === 'client').length;
  const artistCount = users.filter(u => u.role === 'artist').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Panel de Administrador</h2>
          <p className="text-slate-400">Controla el sistema, precios y visualiza reportes.</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Resumen
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'invoices' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Facturación
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'config' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Configuración
          </button>
          <button 
            onClick={() => setActiveTab('db')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center ${activeTab === 'db' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Database className="w-4 h-4 mr-2" /> Base de Datos
          </button>
        </div>
      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-slate-700 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</h3>
              <p className="text-slate-400 text-sm">Ingresos por Créditos</p>
            </div>

            <div className="bg-surface border border-slate-700 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Music className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{requests.length}</h3>
              <p className="text-slate-400 text-sm">Solicitudes Creadas</p>
            </div>

            <div className="bg-surface border border-slate-700 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex flex-col items-end text-xs text-slate-400">
                  <span>{clientCount} Clientes</span>
                  <span>{artistCount} Artistas</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{users.length}</h3>
              <p className="text-slate-400 text-sm">Usuarios Totales</p>
            </div>

            <div className="bg-surface border border-slate-700 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{transactions.length}</h3>
              <p className="text-slate-400 text-sm">Compras Realizadas</p>
            </div>
          </div>

          <div className="bg-surface border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Últimos Usuarios Registrados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-200 uppercase bg-slate-800">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Rol</th>
                    <th className="px-6 py-3">Créditos</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(-5).reverse().map(u => (
                    <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4 uppercase text-xs">
                        <span className={`px-2 py-1 rounded ${u.role === 'artist' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{u.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="animate-in fade-in max-w-xl">
           <div className="bg-surface border border-slate-700 p-8 rounded-xl shadow-lg">
             <div className="flex items-center mb-6">
               <Settings className="w-8 h-8 text-primary mr-3" />
               <h3 className="text-2xl font-bold text-white">Configuración del Sistema</h3>
             </div>

             <div className="mb-6">
               <label className="block text-slate-300 text-sm font-bold mb-2">
                 Precio del Crédito (USD)
               </label>
               <p className="text-xs text-slate-500 mb-2">
                 Este valor determina cuánto pagan los artistas por cada crédito de contacto.
               </p>
               <div className="flex items-center">
                 <div className="bg-slate-800 p-3 rounded-l-lg border border-slate-600 border-r-0 text-slate-400">
                   $
                 </div>
                 <input 
                   type="number"
                   step="0.01"
                   min="0"
                   value={newPrice}
                   onChange={(e) => setNewPrice(e.target.value)}
                   className="flex-1 bg-slate-900 border border-slate-600 p-3 text-white outline-none focus:ring-2 focus:ring-primary rounded-r-lg"
                 />
               </div>
             </div>

             <button 
               onClick={handleUpdatePrice}
               className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-lg flex items-center justify-center transition-all"
             >
               <Save className="w-5 h-5 mr-2" />
               Guardar Cambios
             </button>
           </div>
        </div>
      )}

      {/* DATABASE TAB */}
      {activeTab === 'db' && (
        <div className="animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-slate-700 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2 text-green-400" /> Backup de Datos
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Descarga un archivo JSON con todos los datos actuales del sistema (Usuarios, Solicitudes, Transacciones, Configuración). Útil para migrar o guardar copias de seguridad.
            </p>
            <button 
              onClick={handleDownloadBackup}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Backup (.json)
            </button>
          </div>

          <div className="bg-surface border border-slate-700 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" /> Esquema SQL
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              ¿Listo para ir a Producción? Utiliza el archivo <code>db_schema.sql</code> incluido en el proyecto para crear tu base de datos PostgreSQL real en AWS, Supabase o Render.
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-slate-800">
               <code className="text-xs text-green-400 font-mono">
                  db_schema.sql (disponible en archivos)
               </code>
            </div>
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div className="animate-in fade-in bg-surface border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
             <h3 className="text-xl font-bold text-white">Historial de Transacciones e Invoices</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs text-slate-200 uppercase bg-slate-800">
                  <tr>
                    <th className="px-6 py-3"># Invoice</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Usuario</th>
                    <th className="px-6 py-3 text-right">Créditos</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No hay transacciones registradas.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{t.invoiceNumber}</td>
                        <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString()}</td>
                        <td className="px-6 py-4 text-white font-medium">{t.userName}</td>
                        <td className="px-6 py-4 text-right">{t.amount}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-400">${t.cost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setSelectedInvoice(t)}
                            className="text-secondary hover:text-cyan-300 flex items-center justify-center mx-auto"
                            title="Ver Factura"
                          >
                            <FileText className="w-4 h-4 mr-1" /> Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        </div>
      )}

      <InvoiceModal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        transaction={selectedInvoice} 
      />
    </div>
  );
};
