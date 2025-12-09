import React, { useState, useEffect } from 'react';
import { User, MusicRequest } from '../types';
import { getRequests, saveRequest, deleteRequest } from '../services/storage';
import { RequestFormModal } from './RequestFormModal';
import { Plus, Edit2, Trash2, Users, Calendar, DollarSign, Music } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MusicRequest | null>(null);

  useEffect(() => {
    // Filter only my requests
    const all = getRequests();
    setRequests(all.filter(r => r.clientId === user.id));
  }, [user.id, isModalOpen]);

  const handleSave = (reqData: Omit<MusicRequest, 'id' | 'createdAt' | 'unlockedBy' | 'status'>) => {
    const newReq: MusicRequest = {
      ...reqData,
      id: editingRequest ? editingRequest.id : uuidv4(),
      createdAt: editingRequest ? editingRequest.createdAt : Date.now(),
      unlockedBy: editingRequest ? editingRequest.unlockedBy : [],
      status: editingRequest ? editingRequest.status : 'open',
    };
    saveRequest(newReq);
    setIsModalOpen(false);
    setEditingRequest(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta solicitud?")) {
      deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const openCreate = () => {
    setEditingRequest(null);
    setIsModalOpen(true);
  };

  const openEdit = (req: MusicRequest) => {
    setEditingRequest(req);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Mis Solicitudes</h2>
          <p className="text-slate-400">Gestiona tus requerimientos musicales y sigue el interés de los artistas.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-secondary to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold rounded-full shadow-lg transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Solicitud
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
            <Music className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">No se encontraron solicitudes</h3>
            <p className="text-slate-500 mt-2">Crea tu primera solicitud para empezar a recibir ofertas.</p>
          </div>
        ) : (
          requests.map(req => {
            const isClosed = req.unlockedBy.length >= req.maxOffers;
            return (
              <div key={req.id} className="group bg-surface border border-slate-700 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-slate-500 hover:shadow-2xl">
                 {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-lg ${
                  isClosed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {isClosed ? 'Ofertas Máx Alcanzadas' : 'Abierto'}
                </div>

                <div className="mb-4">
                   <span className="inline-block px-2 py-1 bg-slate-900 text-slate-300 text-xs rounded mb-2 border border-slate-700">
                    {req.genre}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{req.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-slate-400 text-sm mb-6 line-clamp-3 min-h-[60px]">
                  {req.description}
                </p>

                <div className="flex items-center justify-between text-sm text-slate-300 mb-6 bg-slate-900/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                    <span className="font-mono font-bold">{req.budget}</span>
                  </div>
                  <div className="flex items-center" title={`${req.unlockedBy.length} artistas te han contactado`}>
                    <Users className="w-4 h-4 text-secondary mr-1" />
                    <span>{req.unlockedBy.length} / {req.maxOffers} ofertas</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => openEdit(req)}
                    className="flex-1 flex items-center justify-center py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(req.id)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <RequestFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingRequest}
        user={user}
      />
    </div>
  );
};