import React, { useEffect, useState } from "react";
import { User, Solicitud } from "../types";
import { PlusCircle, Loader2 } from "lucide-react";
import { RequestFormModal } from "./RequestFormModal";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===========================================================
  // 🔥 CARGAR SOLICITUDES DEL CLIENTE DESDE POSTGRESQL
  // ===========================================================
  const loadSolicitudes = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/solicitudes/cliente/${user.id}`);

      if (!resp.ok) {
        console.error("Error al cargar solicitudes:", await resp.text());
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setSolicitudes(data);
    } catch (error) {
      console.error("Error de red:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSolicitudes();
  }, []);

  // ===========================================================
  // 🔥 CUANDO SE CREA UNA SOLICITUD DESDE EL MODAL
  // ===========================================================
  const handleSaveSolicitud = () => {
    setIsModalOpen(false);
    loadSolicitudes();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Mis Solicitudes</h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary rounded-lg text-white hover:bg-violet-500 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* LISTADO */}
      {loading ? (
        <div className="text-center py-10 text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      ) : solicitudes.length === 0 ? (
        <p className="text-center text-slate-400 py-10">
          Aún no has creado solicitudes.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {solicitudes.map((s) => (
            <div
              key={s.id}
              className="bg-surface border border-slate-700 p-6 rounded-xl space-y-3"
            >
              <h3 className="text-xl font-bold text-white">{s.titulo}</h3>

              <p className="text-slate-300 text-sm whitespace-pre-line">
                {s.descripcion}
              </p>

              <p className="text-slate-400 text-sm">
                <strong>Género:</strong> {s.tipo_musica}
              </p>

              <p className="text-slate-400 text-sm">
                <strong>Estado:</strong>{" "}
                <span
                  className={
                    s.estado === "abierta"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {s.estado}
                </span>
              </p>

              <p className="text-slate-400 text-sm">
                <strong>Ofertas:</strong> {s.desbloqueos}/{s.cantidad_ofertas}
              </p>

              <p className="text-slate-500 text-xs">
                Creada el:{" "}
                {new Date(s.fecha_creacion).toLocaleString("es-CL")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CREAR SOLICITUD */}
      <RequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSolicitud}
        user={user}
      />
    </div>
  );
};
