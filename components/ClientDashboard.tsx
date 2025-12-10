import React, { useEffect, useState } from "react";
import { User } from "../types";
const API_URL = import.meta.env.VITE_BACKEND_URL || "https://muselink-backend-vzka.onrender.com";

interface Props {
  user: User;
}

export const ClientDashboard: React.FC<Props> = ({ user }) => {
  const [requests, setRequests] = useState([]);

  // Cargar solicitudes del cliente desde la BD
  const loadRequests = async () => {
    try {
      const resp = await fetch(`${API_URL}/solicitudes/cliente/${user.id}`);
      const data = await resp.json();
      setRequests(data);
    } catch (err) {
      console.error("❌ Error cargando solicitudes del cliente:", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Tus Solicitudes</h2>

      {requests.length === 0 ? (
        <p className="text-slate-400">Aún no has creado solicitudes.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold">{req.titulo}</h3>
              <p className="text-slate-300">{req.descripcion}</p>
              <p className="text-sm text-slate-500 mt-2">
                Género: {req.tipo_musica}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
