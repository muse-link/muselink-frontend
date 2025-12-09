import React, { useState, useEffect } from 'react';
import { User, MusicRequest, MusicGenre, SystemConfig } from '../types';
import { getRequests, buyContact, purchaseCredits, getSessionUser, getSystemConfig } from '../services/storage';
import { Search, Filter, Coins, Phone, Mail, Lock, CheckCircle, AlertCircle, DollarSign, User as UserIcon, Calendar } from 'lucide-react';
import { createPaymentPreference, redirectToMercadoPago } from '../services/payments';


interface ArtistDashboardProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ user, onUpdateUser }) => {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MusicRequest[]>([]);
  const [genreFilter, setGenreFilter] = useState<string>('Todas');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const [fromDate, setFromDate] = useState<string>(''); // Date Filter
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({ creditPrice: 0 });
  
  // Refresh data trigger
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const all = getRequests();
    setRequests(all);
    setConfig(getSystemConfig());
  }, [tick]);

  useEffect(() => {
    let result = [...requests];

    // Filter by Genre
    if (genreFilter !== 'Todas') {
      result = result.filter(r => r.genre === genreFilter);
    }

    // Filter by Date (From)
    if (fromDate) {
      const fromTimestamp = new Date(fromDate).getTime();
      result = result.filter(r => r.createdAt >= fromTimestamp);
    }

    // Sort
    result.sort((a, b) => {
      if (dateSort === 'newest') return b.createdAt - a.createdAt;
      return a.createdAt - b.createdAt;
    });

    setFilteredRequests(result);
  }, [requests, genreFilter, dateSort, fromDate]);

  const handleBuyCredit = (amount: number) => {
    const cost = amount * config.creditPrice;
    if (window.confirm(`¿Comprar ${amount} créditos por $${cost.toFixed(2)} USD?`)) {
      // Record transaction and add credits
      purchaseCredits(user.id, amount, cost);
      
      const updatedUser = getSessionUser();
      if (updatedUser) onUpdateUser(updatedUser);
      setBuyModalOpen(false);
      alert("¡Compra exitosa! Créditos añadidos.");
    }
  };

  const handleUnlock = (reqId: string) => {
    if (user.credits < 1) {
      alert("¡Créditos insuficientes! Por favor compra más.");
      setBuyModalOpen(true);
      return;
    }

    if (window.confirm("¿Gastar 1 Crédito para revelar la información de contacto?")) {
      const success = buyContact(user.id, reqId);
      if (success) {
        setTick(t => t + 1); // Refresh requests
        const updatedUser = getSessionUser();
        if (updatedUser) onUpdateUser(updatedUser); // Refresh credits in UI
      } else {
        alert("Fallo al desbloquear. Es posible que se haya alcanzado el máximo de ofertas o que ya lo hayas desbloqueado.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Credit Store */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Encontrar Trabajos</h2>
            <p className="text-indigo-200">Explora oportunidades y conecta con clientes directamente.</p>
          </div>
          <div className="flex items-center space-x-4 bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-right">
              <p className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Tu Saldo</p>
              <p className="text-2xl font-bold text-yellow-400">{user.credits} Créditos</p>
            </div>
            <button 
              onClick={() => setBuyModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg transition-colors flex items-center shadow-lg"
            >
              <Coins className="w-5 h-5 mr-2" />
              Recargar
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 bg-surface p-4 rounded-xl border border-slate-700">
        <div className="flex-1 relative">
           <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
           <input 
             type="text" 
             placeholder="Buscar por título..." 
             className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
             onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const filtered = requests.filter(r => r.title.toLowerCase().includes(term));
                setFilteredRequests(filtered);
             }}
           />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Genre Filter */}
          <div className="relative">
             <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
             <select 
               value={genreFilter}
               onChange={(e) => setGenreFilter(e.target.value)}
               className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
             >
               <option value="Todas">Todos los géneros</option>
               {Object.values(MusicGenre).map(g => <option key={g} value={g}>{g}</option>)}
             </select>
          </div>

          {/* Date Picker Filter (Since) */}
          <div className="relative">
             <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
             <input 
               type="date"
               value={fromDate}
               onChange={(e) => setFromDate(e.target.value)}
               className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
               title="Mostrar solicitudes creadas desde esta fecha"
             />
          </div>

          {/* Sort Order */}
          <select 
               value={dateSort}
               onChange={(e) => setDateSort(e.target.value as 'newest' | 'oldest')}
               className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
             >
               <option value="newest">Más recientes</option>
               <option value="oldest">Más antiguos</option>
             </select>
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.map(req => {
          const isUnlocked = req.unlockedBy.includes(user.id);
          const isFull = req.unlockedBy.length >= req.maxOffers;
          const remainingSlots = req.maxOffers - req.unlockedBy.length;

          return (
            <div key={req.id} className="bg-surface border border-slate-700 rounded-xl p-6 transition-all hover:border-slate-600 flex flex-col md:flex-row gap-6">
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded uppercase tracking-wide">
                    {req.genre}
                  </span>
                  <span className="text-slate-500 text-xs flex items-center">
                     <Calendar className="w-3 h-3 mr-1" />
                     {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  {isFull && !isUnlocked && (
                    <span className="flex items-center text-red-400 text-xs font-bold">
                      <AlertCircle className="w-3 h-3 mr-1" /> Máx Ofertas Alcanzadas
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{req.title}</h3>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{req.description}</p>
                
                <div className="flex items-center gap-6 text-sm">
                   <div className="flex items-center text-green-400 font-mono font-bold">
                     <DollarSign className="w-4 h-4 mr-1" />
                     {req.budget}
                   </div>
                   <div className="flex items-center text-slate-400">
                     <span className={remainingSlots > 0 ? "text-secondary" : "text-red-400"}>
                       {remainingSlots} lugares restantes
                     </span>
                   </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col justify-center min-w-[250px] border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
                {isUnlocked ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 animate-in fade-in">
                    <div className="flex items-center text-green-400 font-bold mb-3">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Datos de Contacto
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 opacity-70" /> {req.clientName}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 opacity-70" /> {req.clientContact.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 opacity-70" /> {req.clientContact.phone}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-3">
                      {isFull ? "Esta solicitud ya no acepta ofertas." : "Desbloquea para ver los datos de contacto."}
                    </p>
                    <button
                      onClick={() => handleUnlock(req.id)}
                      disabled={isFull}
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${
                        isFull 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-white text-dark hover:bg-slate-200'
                      }`}
                    >
                      {isFull ? (
                        <>Cerrado</>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear (1 Crédito)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800 border-dashed">
            <p>No se encontraron solicitudes con tus filtros.</p>
            {fromDate && <p className="text-xs mt-2">Intenta cambiar la fecha de búsqueda.</p>}
          </div>
        )}
      </div>

      {/* Simplified Buy Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-surface border border-slate-700 rounded-xl p-8 max-w-sm w-full text-center relative">
             <button onClick={() => setBuyModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <Lock className="w-5 h-5 rotate-45" /> {/* Close icon visual hack using Lock or just X */}
             </button>
             <Coins className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
             <h3 className="text-2xl font-bold text-white mb-2">Recargar Créditos</h3>
             <p className="text-slate-400 mb-4">El precio actual por crédito es: <strong className="text-white">${config.creditPrice.toFixed(2)} USD</strong></p>
             
             <div className="space-y-3">
               {[1, 5, 10].map(amt => (
                 <button 
                  key={amt}
                  onClick={() => handleBuyCredit(amt)}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-yellow-500 text-white font-medium py-3 rounded-lg transition-all flex justify-between px-4 group"
                 >
                   <span>{amt} Crédito{amt > 1 ? 's' : ''}</span>
                   <span className="text-yellow-500 font-bold group-hover:text-yellow-400">${(amt * config.creditPrice).toFixed(2)}</span>
                 </button>
               ))}
             </div>
             
             <button 
                 onClick={() => setBuyModalOpen(false)}
                 className="mt-6 text-slate-500 hover:text-white text-sm"
               >
                 Cancelar
             </button>
           </div>
        </div>
      )}
    </div>
  );
};