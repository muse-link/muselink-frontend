import React, { useState, useEffect } from 'react';
import { MusicRequest, MusicGenre, User } from '../types';
import { X, Wand2, Loader2 } from 'lucide-react';
import { enhanceDescription } from '../services/geminiService';
const API_URL = import.meta.env.VITE_BACKEND_URL || "https://muselink-backend-vzka.onrender.com";


interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: Omit<MusicRequest, 'id' | 'createdAt' | 'unlockedBy' | 'status'>) => void;
  initialData?: MusicRequest | null;
  user: User;
}

export const RequestFormModal: React.FC<RequestFormModalProps> = ({ 
  isOpen, onClose, onSave, initialData, user 
}) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<MusicGenre>(MusicGenre.Pop);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [maxOffers, setMaxOffers] = useState<number>(3);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setGenre(initialData.genre);
      setDescription(initialData.description);
      setBudget(initialData.budget);
      setMaxOffers(initialData.maxOffers);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setGenre(MusicGenre.Pop);
    setDescription('');
    setBudget(100);
    setMaxOffers(3);
  };

  const handleEnhance = async () => {
    if (!description || !title) return;
    setIsEnhancing(true);
    const improved = await enhanceDescription(description, genre, title);
    setDescription(improved);
    setIsEnhancing(false);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // 1. Lo que el backend espera
    const payload = {
      cliente_id: user.id,          // va a solicitudes.cliente_id
      titulo: title,
      descripcion: description,
      tipo_musica: genre,
      cantidad_ofertas: maxOffers,
      // fecha_evento por ahora va como NULL en el backend
    };

    // 2. Llamada al backend
    const resp = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error("Error creando solicitud:", await resp.text());
      alert("Hubo un problema al crear la solicitud 😢");
      return;
    }

    // Opcional: leer lo que devuelve el backend
    // const saved = await resp.json();
    // console.log("Solicitud guardada en BD:", saved);

    // 3. Seguimos usando onSave para actualizar la UI local
    onSave({
      clientId: user.id,
      clientName: contactName,
      clientContact: {
        email: contactEmail,
        phone: contactPhone || 'No se proporcionó teléfono'
      },
      title,
      genre,
      description,
      budget,
      maxOffers,
    });

    onClose();
  } catch (err) {
    console.error("Error de red creando solicitud:", err);
    alert("No se pudo conectar con el servidor 😢");
  }
};









  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? 'Editar Solicitud' : 'Crear Nueva Solicitud'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="reqForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Ej: Banda de Jazz para Boda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Género</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as MusicGenre)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  {Object.values(MusicGenre).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-300">Descripción</label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !description}
                  className="text-xs flex items-center text-secondary hover:text-cyan-300 disabled:opacity-50 transition-colors"
                >
                  {isEnhancing ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Wand2 className="w-3 h-3 mr-1"/>}
                  Mejorar con IA
                </button>
              </div>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder="Describe tu evento, tamaño del lugar, necesidades de equipo..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Presupuesto ($)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Máx Ofertas Necesarias
                  <span className="text-xs text-slate-500 ml-2 block sm:inline">
                    (La lista se cierra tras esta cantidad de contactos)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={maxOffers}
                  onChange={(e) => setMaxOffers(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
               <h4 className="text-sm font-semibold text-blue-300 mb-1">Privacidad de Datos Personales</h4>
               <p className="text-xs text-blue-200/70">
                 Tu información de contacto ({user.phone}, {user.email}) solo será revelada a los artistas que compren un crédito para contactarte, hasta un máximo de {maxOffers} artistas.
               </p>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-700 bg-surface flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            form="reqForm"
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform active:scale-95 transition-all"
          >
            {initialData ? 'Actualizar' : 'Publicar Solicitud'}
          </button>
        </div>
      </div>
    </div>
  );
};
