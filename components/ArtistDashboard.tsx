import React, { useState, useEffect } from 'react';
import { User } from "../types";
import { Unlock, Coins, Loader2 } from 'lucide-react';

// URL del backend
const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

interface ArtistDashboardProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ user, onUpdateUser }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================================
  // 1️⃣ Cargar solicitudes desde el BACKEND (NO storage local)
  // ==========================================================
  const loadRequests = async () => {
    try {
      const resp = await fetch(`${API_URL}/solicitudes`);
      const data = await resp.json();
      setRequests(data);
    } catch (err) {
      console.error("Error al cargar solicitudes desde backend", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ==========================================================
  // 2️⃣ Comprar créditos (esto sí queda en frontend)
  // ==========================================================
  const handleAddCredits = () => {
    const updated = { ...user, credits: user.credits + 3 };
    onUpdateUser(updated);
    alert("Compraste 3 créditos 🎉");
  };

  // ==========================================================
  // 3️⃣ Desbloquear contacto REAL
  // ==========================================================
  const handleUnlock = async (reqId: number) => {
    if (user.credits <= 0) {
      alert("No tienes créditos suficientes 😢");
      return;
    }

    setIsLoading(true);

    try {
      const resp = await fetch(`${API_URL}/solicitudes/${reqId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artista_id: user.id }),
      });

      if (!resp.ok) {
        const msg = await resp.text();
        alert("Fallo al desbloquear: " + msg);
        setIsLoading(false);
        return;
      }

      // Si desbloquea correctamente → descuenta crédito local
      const updated = { ...user, credits: user.credits - 1 };
      onUpdateUser(updated);

      alert("Contacto desbloqueado correctamente 🎉");

      // Recargar solicitudes actualizadas del backend
      loadRequests();
    } catch (err) {
      console.error("Error desbloqueando solicitud", err);
      alert("Error de conexión con el servidor 😢");
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-slate-700">
        <h2 className="text-lg text-white font-bold">
          Bienvenido/a, {user.name} 👋
        </h2>

        <div className="flex items-center space-x-3">
          <span className="text-white flex items-center">
            <Coins className="w-5 h-5 mr-1 text-yellow-400" />
            {user.credits} Créditos
          </span>

          <button
            onClick={handleAddCredits}
            className="px-4 py-2 bg-primary hover:bg-purple-600 text-white rounded-lg shadow"
          >
            Comprar Créditos
          </button>
        </div>
      </div>

      {/* LISTADO DE SOLICITUDES */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-slate-400">No hay solicitudes disponibles aún.</p>
        ) : (
          requests.map((req) => {
            const lugaresRestantes =
              req.cantidad_ofertas - (req.unlocked_by?.length || 0);

            return (
              <div
                key={req.id}
                className="bg-surface p-4 rounded-xl border border-slate-700 shadow"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    {req.tipo_musica}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(req.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl text-white font-bold">{req.titulo}</h3>
                <p className="text-slate-300 text-sm mt-1">{req.descripcion}</p>

                <p className="mt-3 text-green-400 font-semibold">
                  ${req.presupuesto || 100}
                </p>

                <p className="text-slate-400 text-sm">
                  {lugaresRestantes} lugares restantes
                </p>

                <button
                  disabled={isLoading}
                  onClick={() => handleUnlock(req.id)}
                  className="mt-3 w-full py-2 bg-primary hover:bg-violet-600 text-white rounded-lg flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 mr-2" />
                      Desbloquear (1 Crédito)
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
