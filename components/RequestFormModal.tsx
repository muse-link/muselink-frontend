import React, { useState, useEffect } from "react";
import { MusicGenre, User } from "../types";
import { X, Wand2, Loader2 } from "lucide-react";
import { enhanceDescription } from "../services/geminiService";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Ahora solo recarga el listado
  user: User;
  initialData?: null; // Por ahora no editamos
}

export const RequestFormModal: React.FC<RequestFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<MusicGenre>(MusicGenre.Pop);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<number>(100);
  const [maxOffers, setMaxOffers] = useState<number>(3);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setGenre(MusicGenre.Pop);
    setDescription("");
    setBudget(100);
    setMaxOffers(3);
  };

  // IA description improvement
  const handleEnhance = async () => {
    if (!description || !title) return;

    setIsEnhancing(true);
    const improved = await enhanceDescription(description, genre, title);
    setDescription(improved);
    setIsEnhancing(false);
  };

  // ===========================================================
  // 🔥 ENVIAR SOLICITUD AL BACKEND
  // ===========================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      cliente_id: user.id,
      titulo: title,
      descripcion: description,
      tipo_musica: genre,
      cantidad_ofertas: maxOffers,
      fecha_evento: null, // Por ahora no usas fecha
    };

    try {
      const resp = await fetch(`${API_URL}/solicitudes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        console.error("Error creando solicitud:", await resp.text());
        alert("Hubo un problema al crear la solicitud.");
        return;
      }

      onSave(); // ClientDashboard recarga solicitudes
      onClose();
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error al conectar con el servidor.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Crear Nueva Solicitud</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto">
          <form id="reqForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Título + Género */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                  placeholder="Ej: Banda para Año Nuevo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Género
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as MusicGenre)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                >
                  {Object.values(MusicGenre).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-300">
                  Descripción
                </label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !description}
                  className="text-xs flex items-center text-secondary hover:text-cyan-300 disabled:opacity-50"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3 mr-1" />
                  )}
                  Mejorar con IA
                </button>
              </div>

              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white resize-none"
                placeholder="Describe el tipo de evento, lugar, cantidad de personas..."
              />
            </div>

            {/* Presupuesto + Máx Ofertas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Presupuesto ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Cantidad máxima de artistas que pueden contactarte
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={maxOffers}
                  onChange={(e) => setMaxOffers(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>
            </div>

            {/* Privacidad */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-1">
                Privacidad de Datos Personales
              </h4>
              <p className="text-xs text-blue-200/70">
                Tu información de contacto ({user.phone}, {user.email}) solo será revelada 
                a los artistas que compren un crédito para desbloquear tu solicitud.
              </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-surface flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white"
          >
            Cancelar
          </button>

          <button
            form="reqForm"
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-violet-600 transition-all"
          >
            Publicar Solicitud
          </button>
        </div>
      </div>
    </div>
  );
};
