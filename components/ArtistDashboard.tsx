import React, { useEffect, useMemo, useState } from "react";
import { User } from "../types";
import {
  Search,
  Calendar,
  DollarSign,
  Music,
  Loader2,
  LockOpen,
  Info,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_BACKEND_URL || "https://muselink-backend-vzka.onrender.com";

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
  desbloqueos?: number; // (si tu GET /solicitudes lo incluye)
}

type ContactoCliente = {
  nombre: string;
  email: string;
  telefono: string | null;
};

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

  // filtros (se mantienen)
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // ✅ NUEVO: contactos desbloqueados en esta sesión (no rompe tu lógica)
  const [contactos, setContactos] = useState<Record<number, ContactoCliente>>({});

  useEffect(() => {
    loadSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ========================================
   *  🔥 CARGAR SOLICITUDES DESDE EL BACKEND
   * ======================================== */
  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/solicitudes`);
      if (!resp.ok) {
        const t = await resp.text();
        console.error("Error HTTP al cargar solicitudes:", t);
        alert("Error cargando solicitudes desde el servidor");
        setLoading(false);
        return;
      }
      const data = await resp.json();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
      alert("Error cargando solicitudes desde el servidor");
    }
    setLoading(false);
  };

  /** ========================================
   *   🔓 DESBLOQUEAR UNA SOLICITUD
   * ======================================== */
  const desbloquear = async (solicitudId: number) => {
    if (user.credits <= 0) {
      alert("No tienes créditos suficientes para desbloquear esta solicitud.");
      return;
    }

    setUnlockLoading(solicitudId);

    try {
      const resp = await fetch(`${API_URL}/solicitudes/desbloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artista_id: user.id,
          solicitud_id: solicitudId,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Error al desbloquear:", errText);

        // Mensaje amigable desde backend
        try {
          const parsed = JSON.parse(errText);
          alert(parsed.error || "Error al desbloquear solicitud.");
        } catch {
          alert("Error al desbloquear solicitud.");
        }

        setUnlockLoading(null);
        return;
      }

      const data = await resp.json();

      // ✅ Mantiene tu lógica: créditos vienen desde el backend/BD
      if (typeof data.nuevosCreditos === "number") {
        onUpdateUser({ ...user, credits: data.nuevosCreditos });
      }

      // ✅ NUEVO: si backend devuelve contacto, lo mostramos en la tarjeta
      if (data.contacto) {
        setContactos((prev) => ({
          ...prev,
          [solicitudId]: {
            nombre: data.contacto.nombre,
            email: data.contacto.email,
            telefono: data.contacto.telefono ?? null,
          },
        }));
      }

      // Recargar para actualizar cupos/contadores si aplica
      await loadSolicitudes();
    } catch (e) {
      console.error("Error en red desbloqueando:", e);
      alert("Error al conectar con el servidor.");
    }

    setUnlockLoading(null);
  };

  /** ========================================
   *   🔍 FILTRADO + ORDEN (se mantiene)
   * ======================================== */
  const filtered = useMemo(() => {
    return solicitudes
      .filter((s) => s.estado === "abierta")
      .filter((s) =>
        search ? s.titulo.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((s) => (genreFilter ? s.tipo_musica === genreFilter : true))
      .sort((a, b) => {
        const ta = new Date(a.fecha_creacion).getTime();
        const tb = new Date(b.fecha_creacion).getTime();
        return sortOrder === "newest" ? tb - ta : ta - tb;
      });
  }, [solicitudes, search, genreFilter, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold text-white">Solicitudes Disponibles</h2>
        <div className="px-4 py-2 bg-slate-800 text-white rounded-lg">
          Créditos: {user.credits}
        </div>
      </div>

      {/* 🔍 Filtros (se mantienen) */}
      <div className="bg-surface border border-slate-700 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-2">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input
            placeholder="Buscar..."
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

      {/* 🔥 LISTADO */}
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

            // ✅ NUEVO: si ya tenemos contacto en memoria, lo mostramos y deshabilitamos
            const contacto = contactos[s.id];

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

                <div className="text-slate-300 text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                  {s.fecha_evento ? s.fecha_evento : "Sin fecha"}
                </div>

                <div className="text-slate-300 text-sm flex items-center">
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

                {/* ✅ NUEVO: bloque contacto si ya desbloqueaste */}
                {contacto && (
                  <div className="mt-3 bg-slate-900 border border-emerald-600 rounded-lg p-3 text-sm text-emerald-100">
                    <div className="flex items-center mb-1">
                      <Info className="w-4 h-4 mr-1 text-emerald-300" />
                      <span className="font-semibold">
                        Datos de contacto desbloqueados
                      </span>
                    </div>
                    <p>
                      <span className="font-semibold">Nombre: </span>
                      {contacto.nombre}
                    </p>
                    <p>
                      <span className="font-semibold">Email: </span>
                      {contacto.email}
                    </p>
                    {contacto.telefono && (
                      <p>
                        <span className="font-semibold">Teléfono: </span>
                        {contacto.telefono}
                      </p>
                    )}
                  </div>
                )}

                {/* Botón desbloquear (misma lógica, solo se deshabilita si ya hay contacto) */}
                <button
                  disabled={unlockLoading === s.id || agotado || !!contacto}
                  onClick={() => desbloquear(s.id)}
                  className={`w-full mt-3 py-2 rounded-lg font-bold flex justify-center items-center transition-all ${
                    agotado || contacto
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-primary hover:bg-violet-600 text-white"
                  }`}
                >
                  {unlockLoading === s.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LockOpen className="w-5 h-5 mr-2" />
                      {contacto
                        ? "Contacto desbloqueado"
                        : "Desbloquear contacto (1 Crédito)"}
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

