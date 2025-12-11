import React, { useState, useEffect } from "react";
import { User } from "../types";
import {
  Search,
  Loader2,
  Calendar,
  DollarSign,
  Music,
  LockOpen,
} from "lucide-react";

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
  desbloqueos: number; // conteo que viene desde el backend
}

interface ArtistDashboardProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  user,
  onUpdateUser,
}) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockLoading, setUnlockLoading] = useState<number | null>(null);

  // filtros
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    loadSolicitudes();
  }, []);

  // =====================================================
  // 🔥 CARGAR SOLICITUDES DESDE EL BACKEND
  // =====================================================
  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/solicitudes`);
      if (!resp.ok) throw new Error("HTTP error");

      const data = await resp.json();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      alert("No se pudieron cargar las solicitudes desde el servidor");
    }
    setLoading(false);
  };

  // =====================================================
  // 🔥 DESBLOQUEAR CONTACTO (consume crédito)
  // =====================================================
  const desbloquear = async (solicitudId: number) => {
    if (user.credits <= 0) {
      alert("No tienes créditos suficientes para desbloquear esta solicitud.");
      return;
    }

    setUnlockLoading(solicitudId);

    try {
      const resp = await fetch(`${API_URL}/solicitudes/desbloquear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artista_id: user.id,
          solicitud_id: solicitudId,
        }),
      });

      if (!resp.ok) {
        const e = await resp.text();
        alert("Error al desbloquear: " + e);
        setUnlockLoading(null);
        return;
      }

      const data = await resp.json();

      onUpdateUser({
        ...user,
        credits: data.nuevosCreditos,
      });

      await loadSolicitudes();
    } catch (err) {
      console.error("Error desbloqueando:", err);
      alert("Error en la conexión al servidor.");
    }

    setUnlockLoading(null);
  };

  // =====================================================
  // 🔍 APLICAR FILTROS
  // =====================================================
  const filtered = solicitudes
    .filter((s) => s.estado === "abierta") // solo abiertas
    .filter((s) =>
      search ? s.titulo.toLowerCase().includes(search.toLowerCase()) : true
    )
    .filter((s) => (genreFilter ? s.tipo_musica === genreFilter : true))
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.fecha_creacion).getTime() -
          new Date(a.fecha_creacion).getTime()
        : new Date(a.fecha_creacion).getTime() -
          new Date(b.fecha_creacion).getTime()
    );

  // =====================================================
  // 🔥 RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Solicitudes Disponibles</h2>
        <div className="px-4 py-2 bg-slate-800 text-white rounded-lg">
          Créditos: {user.credits}
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-surface border border-slate-700 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Buscador */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-2">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white w-full"
          />
        </div>

        {/* Género */}
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option value="">Todos los géneros</option>
          <option value="Pop">Pop</option>
          <option value="Rock">Rock</option>
          <option value="Latina">Latina</option>
          <option value="Cumbia">Cumbia</option>
          <option value="Jazz">Jazz</option>
        </select>

        {/* Orden */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
        </select>
      </div>

      {/* LISTADO */}
      {loading ? (
        <div className="text-white text-center py-10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-center py-10">
          No hay solicitudes disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((s) => {
            const cuposRestantes = s.cantidad_ofertas - s.desbloqueos;
            const agotado = cuposRestantes <= 0;

            return (
              <div
                key={s.id}
                className="bg-surface border border-slate-700 rounded-xl p-6 space-y-3"
              >
                <h3 className="text-xl font-bold text-white">{s.titulo}</h3>

                <div className="text-slate-400 text-sm whitespace-pre-line">
                  {s.descripcion}
                </div>

                <div className="flex items-center text-slate-300 text-sm">
                  <Music className="w-4 h-4 mr-1 text-purple-400" />
                  {s.tipo_musica}
                </div>

                <div className="flex items-center text-slate-300 text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                  {s.fecha_evento ? s.fecha_evento : "Sin fecha"}
                </div>

                <div className="flex items-center text-slate-300 text-sm">
                  <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                  Presupuesto variable
                </div>

                <div className="text-sm text-slate-400">
                  Ofertas restantes:{" "}
                  <span
                    className={
                      agotado ? "text-red-400 font-bold" : "text-green-400"
                    }
                  >
                    {cuposRestantes}
                  </span>
                </div>

                {/* BOTÓN DESBLOQUEAR */}
                <button
                  disabled={unlockLoading === s.id || agotado}
                  onClick={() => desbloquear(s.id)}
                  className={`w-full mt-3 py-2 rounded-lg font-bold flex justify-center items-center transition-all ${
                    agotado
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-primary hover:bg-violet-600 text-white"
                  }`}
                >
                  {unlockLoading === s.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LockOpen className="w-5 h-5 mr-2" />
                      Desbloquear contacto
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
