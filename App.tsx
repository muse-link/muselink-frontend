import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ClientDashboard } from "./components/ClientDashboard";
import { ArtistDashboard } from "./components/ArtistDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { getSessionUser, setSessionUser } from "./services/storage";
import { User } from "./types";
import { Music, ArrowRight, Lock } from "lucide-react";

// URL del backend
const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://muselink-backend-vzka.onrender.com";

type BackendUser = {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  credits?: number;
};

// 👉 AQUÍ EL MAPEO CORRECTO SEGÚN TU TABLA ROLES
function mapRolIdToRole(rol_id: number): "client" | "artist" | "admin" {
  switch (rol_id) {
    case 1:
      return "admin"; // id 1 => admin
    case 2:
      return "artist"; // id 2 => artista
    case 3:
      return "client"; // id 3 => cliente
    default:
      return "client";
  }
}

// =======================
// LOGIN + REGISTRO
// =======================
const LoginScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<"client" | "artist">("client"); // SOLO client/artist
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRegistering) {
        // -------- REGISTRO --------
        if (!password || password.length < 3) {
          alert("La contraseña debe tener al menos 3 caracteres.");
          return;
        }
        if (role === "client" && !phone) {
          alert("El teléfono es obligatorio para clientes.");
          return;
        }

        // backendRole en español según tu tabla: admin, artista, cliente
        const backendRole = role === "client" ? "cliente" : "artista";

        const resp = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: name,
            email,
            password,
            role: backendRole,
          }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || "Error al registrarse");
          return;
        }

        const data = await resp.json();
        const apiUser = data.user as BackendUser;

        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        const mappedRole = mapRolIdToRole(apiUser.rol_id);

        const newUser: User = {
          id: String(apiUser.id),
          name: apiUser.nombre,
          email: apiUser.email,
          role: mappedRole,
          phone: role === "client" ? phone : undefined,
          credits: mappedRole === "artist" ? 3 : 0,
          password: "",
        };

        onLogin(newUser);
        resetForm();
      } else {
        // -------- LOGIN --------
        const resp = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || "Usuario o contraseña incorrectos");
          return;
        }

        const data = await resp.json();
        const apiUser = data.user as BackendUser;

        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        const mappedRole = mapRolIdToRole(apiUser.rol_id);

        const loggedUser: User = {
          id: String(apiUser.id),
          name: apiUser.nombre,
          email: apiUser.email,
          role: mappedRole, // ¡SOLO backend decide el rol!
          phone: undefined,
          credits: mappedRole === "artist" ? 3 : 0,
          password: "",
        };

        onLogin(loggedUser);
        resetForm();
      }
    } catch (error) {
      console.error("Error en auth:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md bg-surface/50 backdrop-blur-lg border border-slate-700 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg">
            <Music className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {isRegistering ? "Únete a MuseLink" : "Bienvenido de nuevo"}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          La mejor plataforma para talento musical.
        </p>

        {/* Selector de tipo de cuenta */}
        <div className="flex bg-slate-900 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
              role === "client"
                ? "bg-secondary text-white"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setRole("client")}
          >
            Cliente
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
              role === "artist"
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setRole("artist")}
          >
            Artista
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
            <Lock className="absolute right-3 top-9 w-4 h-4 text-slate-500" />
          </div>

          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>

              {role === "client" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-white shadow-lg transform active:scale-95 transition-all mt-6 bg-secondary hover:bg-cyan-400"
          >
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}{" "}
            <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              resetForm();
            }}
            className="text-sm text-slate-400 hover:text-white underline"
          >
            {isRegistering
              ? "¿Ya tienes cuenta? Inicia Sesión"
              : "¿Nuevo en MuseLink? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// =======================
// APP PRINCIPAL
// =======================
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSessionUser();
    if (session) setUser(session);
    setIsLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setSessionUser(u);
    setUser(u);
  };

  const handleLogout = () => {
    setSessionUser(null);
    setUser(null);
    localStorage.removeItem("authToken");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-white">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "client":
        return <ClientDashboard user={user} />;
      case "artist":
        return <ArtistDashboard user={user} onUpdateUser={setUser} />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <ClientDashboard user={user} />;
    }
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={renderDashboard()} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;


