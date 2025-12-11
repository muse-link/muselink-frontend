import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Plus, Loader2, Calendar, Music, Users } from "lucide-react";
import { RequestFormModal } from "./RequestFormModal";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

interface Solicitud {
  id: number;
  cliente_id: number;
  titulo: string;
  descripcion: string;
  tipo_musica: string;
  fecha_evento: string | null;
  cantidad_ofertas: number;
  estado: string;
  fecha_creacion: string;
  desbloqueos?: number;
}

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/solicitudes`);
      if (!resp.ok) {
        console.error("HTTP error:", await resp.text());
        alert("Error cargando tus solicitudes");
        setLoading(false);
        return;
      }
      const data: Solicitud[] = await resp.json();
      const mine = data.filter((s) => s.cliente_id === Number(user.id));
      setSolicitudes(mine);
    } catch (e) {
      console.error("Error cargando solicitudes del cliente:", e);
      alert("Error cargando tus solicitudes");
    }
    setLoading(false);
  };

  const handleCreated = () => {
    setIsFormOpen(false);
    loadSolicitudes();
  };

  const abiertas = solicitudes.filter((s) => s.estado === "abierta");
  const cerradas = solicitudes.filter((s) => s.estado !== "abierta");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Hola, {user.name || "Cliente"} 👋
          </h2>
          <p className="text-slate-400 text-sm">
            Administra tus solicitudes para encontrar a la banda perfecta.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-violet-600 text-white font-semibold shadow-lg transform active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Solicitud
        </button>
      </div>

      {loading ? (
        <div className="text-center text-white py-10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-surface border border-dashed border-slate-600 rounded-xl p-8 text-center text-slate-300">
          <p className="mb-4">
            Aún no has creado solicitudes. ¡Crea la primera y recibe propuestas
            de artistas!
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary hover:bg-violet-600 text-white font-semibold shadow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear solicitud
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Abiertas */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Solicitudes activas
            </h3>
            {abiertas.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No tienes solicitudes abiertas en este momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {abiertas.map((s) => {
                  const desbloqueos = s.desbloqueos || 0;
                  const cuposRestantes =
                    s.cantidad_ofertas - (desbloqueos ?? 0);

                  return (
                    <div
                      key={s.id}
                      className="bg-surface border border-slate-700 rounded-xl p-5 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 mb-1">
                            {s.tipo_musica}
                          </span>
                          <h4 className="text-lg font-bold text-white">
                            {s.titulo}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(s.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-3 whitespace-pre-line">
                        {s.descripcion}
                      </p>
                      <div className="flex flex-col gap-1 text-xs text-slate-400 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-blue-400" />
                          {s.fecha_evento
                            ? `Fecha evento: ${s.fecha_evento}`
                            : "Fecha evento por confirmar"}
                        </div>
                        <div>
                          Ofertas permitidas:{" "}
                          <span className="font-semibold text-slate-200">
                            {s.cantidad_ofertas}
                          </span>{" "}
                          · Desbloqueos:{" "}
                          <span className="font-semibold text-slate-200">
                            {desbloqueos}
                          </span>{" "}
                          · Lugares restantes:{" "}
                          <span
                            className={
                              cuposRestantes <= 0
                                ? "font-semibold text-red-400"
                                : "font-semibold text-green-400"
                            }
                          >
                            {Math.max(cuposRestantes, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Cerradas (por ahora casi no habrá) */}
          {cerradas.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                Historial de solicitudes
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cerradas.map((s) => (
                  <div
                    key={s.id}
                    className="bg-surface border border-slate-800 rounded-xl p-5 opacity-70"
                  >
                    <h4 className="text-lg font-bold text-white">
                      {s.titulo}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {new Date(s.fecha_creacion).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                      {s.descripcion}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Estado: {s.estado}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <RequestFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => handleCreated()}
        user={user}
      />
    </div>
  );
};
