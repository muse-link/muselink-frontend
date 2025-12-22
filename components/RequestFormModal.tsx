import React, { useState, useEffect } from "react";
import { MusicGenre, MusicRequest, User } from "../types";
import { X, Wand2, Loader2 } from "lucide-react";
import { enhanceDescription } from "../services/geminiService";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    req: Omit<
      MusicRequest,
      "id" | "createdAt" | "unlockedBy" | "status"
    >
  ) => void;
  initialData?: MusicRequest | null;
  user: User;
}

export const RequestFormModal: React.FC<RequestFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  user,
}) => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<MusicGenre>(MusicGenre.Pop);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<number>(100);
  const [maxOffers, setMaxOffers] = useState<number>(3);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setTitle("");
    setGenre(MusicGenre.Pop);
    setDescription("");
    setBudget(100);
    setMaxOffers(3);
  };

  const handleEnhance = async () => {
    if (!description || !title) return;
    try {
      setIsEnhancing(true);
      const improved = await enhanceDescription(description, genre, title);
      setDescription(improved);
    } catch (e) {
      console.error("Error mejorando descripción:", e);
      alert("No se pudo mejorar la descripción con IA.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert("Usuario no válido");
      return;
    }

    setIsSaving(true);

    try {

      const payload = {
  cliente_id: Number(user.id),
  titulo: title,
  descripcion: description,
  tipo_musica: genre,
  cantidad_ofertas: maxOffers,
  fecha_evento: null as string | null,
   presupuesto: budget, // ESTA LÍNEA

  // ✅ ESTA ES LA CLAVE
  presupuesto: budget,
};

const url = initialData
  ? `${API_URL}/solicitudes/${initialData.id}`
  : `${API_URL}/solicitudes`;

const method = initialData ? "PUT" : "POST";

const resp = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});



      

      if (!resp.ok) {
        console.error("Error creando solicitud:", await resp.text());
        alert("Hubo un problema al crear la solicitud 😢");
        setIsSaving(false);
        return;
      }

      // Opcional: podrías leer la respuesta del backend si quieres
      // const saved = await resp.json();

      onSave({
        clientId: user.id,
        clientName: user.name,
        clientContact: {
          email: user.email,
          phone: user.phone || "",
        },
        title,
        genre,
        description,
        budget,
        maxOffers,
      });

      onClose();
      resetForm();
    } catch (err) {
      console.error("Error de red creando solicitud:", err);
      alert("No se pudo conectar con el servidor 😢");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? "Editar Solicitud" : "Crear Nueva Solicitud"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="reqForm" onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Ej: Banda de cumbia para Año Nuevo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Género
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as MusicGenre)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  {Object.values(MusicGenre).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-300">
                  Descripción
                </label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !description}
                  className="text-xs flex items-center text-secondary hover:text-cyan-300 disabled:opacity-50 transition-colors"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                placeholder="Describe tu evento, lugar, cantidad de personas, tipo de show que buscas..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Presupuesto aproximado ($)
                </label>
                <input
                  type="number"
                  min={0}
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
                  min={1}
                  max={50}
                  required
                  value={maxOffers}
                  onChange={(e) => setMaxOffers(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-xs text-blue-100">
              <p className="font-semibold mb-1">Privacidad de datos</p>
              <p>
                Tu información de contacto ({user.phone || "sin teléfono"},{" "}
                {user.email}) solo será revelada a los artistas que compren un
                crédito para contactarte, hasta un máximo de {maxOffers}{" "}
                artistas.
              </p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700 bg-surface flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            form="reqForm"
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform active:scale-95 transition-all inline-flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>{initialData ? "Actualizar" : "Publicar Solicitud"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
