import React, { useState, useEffect } from "react";
import { MusicGenre, User } from "../types";
import { X } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://muselink-backend-vzka.onrender.com";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const RequestFormModal: React.FC<Props> = ({ isOpen, onClose, user }) => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<MusicGenre>(MusicGenre.Pop);
  const [description, setDescription] = useState("");
  const [maxOffers, setMaxOffers] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      cliente_id: user.id,
      titulo: title,
      descripcion: description,
      tipo_musica: genre,
      cantidad_ofertas: maxOffers,
    };

    try {
      const resp = await fetch(`${API_URL}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        alert("Error al crear la solicitud.");
        return;
      }

      alert("Solicitud creada correctamente 🎉");
      onClose();
    } catch (error) {
      console.error("❌ Error creando solicitud:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 p-6 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-xl">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Crear Nueva Solicitud</h2>
          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Título</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Género Musical</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded"
              value={genre}
              onChange={(e) => setGenre(e.target.value as MusicGenre)}
            >
              {Object.values(MusicGenre).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Descripción</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Cantidad máxima de ofertas</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded"
              value={maxOffers}
              onChange={(e) => setMaxOffers(Number(e.target.value))}
              min="1"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded text-white">
            Publicar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
};

