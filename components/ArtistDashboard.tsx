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
  desbloqueos?: number;
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

  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/solicitudes`);
      if (!resp.ok) {
        console.error("HTTP error:", await resp.text());
        alert("Error cargando solicitudes desde el servidor");
        setLoading(false);
        return;
      }
      const data: Solicitud[] = await resp.json();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      alert("Error cargando solicitudes desde el servidor");
    }
    setLoading(false);
  };

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
          artista_id: Number(user.id),
          solicitud_id: solicitudId,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Error al desbloquear:", errText);
        alert(
          "Falló al desbloquear. Es posible que se haya alcanzado el máximo de ofertas o que ya lo hayas desbloqueado."
        );
        setUnlockLoading(null);
        return;
      }

      const data = await resp.json();

      onUpdateUser({
        ...user,
        credits: data.nuevosCreditos,
      });

      await loadSolicitudes();
    } catch (e) {
      console.error("Error de red desbloqueando:", e);
      alert("Error al conectar con el servidor.");
    }

    setUnlockLoading(null);
  };

  const filtered = solicitudes
    .filter((s) => s.estado === "abierta")
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Solicitudes Disponibles</h2>
        <div className="px-4 py-2 bg-slate-800 text-white rounded-lg">
          Créditos: {user.credits}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-surface border border-slate-700 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-2">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white w-full"
          />
        </div>

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

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
        </select>
      </div>

      {/* Listado */}
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
            const desbloqueos = s.desbloqueos || 0;
            const cuposRestantes = s.cantidad_ofertas - desbloqueos;
            const agotado = cuposRestantes <= 0;

            return (
              <div
                key={s.id}
                className="bg-surface border border-slate-700 rounded-xl p-6 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 mb-2">
                      {s.tipo_musica}
                    </span>
                    <h3 className="text-xl font-bold text-white">{s.titulo}</h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(s.fecha_creacion).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-slate-300 text-sm whitespace-pre-line">
                  {s.descripcion}
                </div>

                <div className="flex flex-col gap-1 text-sm text-slate-300 mt-2">
                  <div className="flex items-center">
                    <Music className="w-4 h-4 mr-1 text-purple-400" />
                    Género: {s.tipo_musica}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                    {s.fecha_evento ? `Evento: ${s.fecha_evento}` : "Sin fecha"}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                    Presupuesto: a negociar
                  </div>
                  <div className="text-slate-400">
                    Ofertas restantes:{" "}
                    <span
                      className={
                        agotado
                          ? "text-red-400 font-bold"
                          : "text-green-400 font-bold"
                      }
                    >
                      {cuposRestantes}
                    </span>
                  </div>
                </div>

                <button
                  disabled={unlockLoading === s.id || agotado}
                  onClick={() => desbloquear(s.id)}
                  className={`w-full mt-4 py-2 rounded-lg font-bold flex justify-center items-center transition-all ${
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
                      Desbloquear contacto (1 Crédito)
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
