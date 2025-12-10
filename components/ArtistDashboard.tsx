import React, { useEffect, useState } from "react";
import { User } from "../types";
const API_URL = import.meta.env.VITE_BACKEND_URL || "https://muselink-backend-vzka.onrender.com";

interface Props {
  user: User;
}

export const ArtistDashboard: React.FC<Props> = ({ user }) => {
  const [requests, setRequests] = useState([]);

  // ===========================
  // Cargar TODAS las solicitudes desde BD
  // ===========================
  const loadRequests = async () => {
    try {
      const resp = await fetch(`${API_URL}/solicitudes`);
      const data = await resp.json();
      setRequests(data);
    } catch (err) {
      console.error("❌ Error obteniendo solicitudes:", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ===========================
  // Desbloquear solicitud
  // ===========================
  const unlockRequest = async (solicitudId: number) => {
    try {
      const resp = await fetch(`${API_URL}/solicitudes/${solicitudId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artista_id: user.id }),
      });

      const data = await resp.json();
      if (data.success) {
        alert("Contacto desbloqueado con éxito 🎉");
      } else {
        alert("No se pudo desbloquear.");
      }
    } catch (err) {
      console.error("❌ Error desbloqueando solicitud:", err);
      alert("Error al desbloquear solicitud.");
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Solicitudes Disponibles</h2>

      {requests.length === 0 ? (
        <p className="text-slate-400">No hay solicitudes por ahora.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold">{req.titulo}</h3>
              <p className="text-slate-300">{req.descripcion}</p>

              <button
                onClick={() => unlockRequest(req.id)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
              >
                Desbloquear Contacto
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
