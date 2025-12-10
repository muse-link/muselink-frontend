import React, { useEffect, useState } from "react";
import { MusicRequest, User } from "../types";
import { Lock, Unlock, CreditCard } from "lucide-react";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

interface ArtistDashboardProps {
  user: User;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ user }) => {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<number | null>(null);

  // ================================
  // 🔥 Cargar solicitudes desde backend
  // ================================
  const loadRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitudes`);
      if (!res.ok) {
        console.error("Error cargando solicitudes:", await res.text());
        return;
      }

      const data = await res.json();
      setRequests(data); // ← solicitudes reales desde PostgreSQL
    } catch (err) {
      console.error("Error de red:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ================================
  // 🔓 Desbloquear solicitud
  // ================================
  const unlockRequest = async (requestId: number) => {
    if (user.credits <= 0) {
      alert("No tienes créditos disponibles 😢");
      return;
    }

    setUnlocking(requestId);

    try {
      const res = await fetch(`${API_URL}/solicitudes/${requestId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist_id: user.id }),
      });

      if (!res.ok) {
        alert(
          "Fallo al desbloquear. Es posible que se haya alcanzado el máximo de ofertas o ya lo hayas desbloqueado."
        );
        return;
      }

      alert("Solicitud desbloqueada correctamente 🎉");

      loadRequests(); // refrescar solicitudes
    } catch (err) {
      console.error("Error desbloqueando:", err);
      alert("Error de conexión.");
    } finally {
      setUnlocking(null);
    }
  };

  // ================================
  // 🖼 Renderizar interfaz
  // ================================
  if (loading)
    return (
      <div className="text-center text-slate-300 mt-20">
        Cargando solicitudes...
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="bg-surface border border-slate-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">
          Bienvenido/a, {user.name} 👋
        </h2>
        <p className="text-slate-400 mt-1">
          Aquí puedes ver solicitudes creadas por clientes y desbloquearlas para
          acceder a sus datos de contacto.
        </p>

        <div className="mt-4 text-yellow-300 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> {user.credits} Créditos
        </div>
      </div>

      {/* LISTA DE SOLICITUDES */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-slate-400">No hay solicitudes disponibles aún.</p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-surface border border-slate-700 p-5 rounded-xl flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{req.titulo}</h3>

                <span className="text-sm text-slate-400">
                  {new Date(req.fecha_creacion).toLocaleDateString()}
                </span>
              </div>

              <p className="text-slate-300">{req.descripcion}</p>

              <div className="text-slate-400 text-sm">
                <strong>Género:</strong> {req.tipo_musica}
              </div>

              <div className="text-green-400 font-bold text-lg">
                ${req.budget ?? 100}
              </div>

              {/* Botón Desbloquear */}
              <button
                disabled={unlocking === req.id}
                onClick={() => unlockRequest(req.id)}
                className="mt-3 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-white flex items-center gap-2"
              >
                {unlocking === req.id ? (
                  <>
                    <Unlock className="animate-pulse" />
                    Desbloqueando...
                  </>
                ) : (
                  <>
                    <Lock /> Desbloquear (1 Crédito)
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
