import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ClientDashboard } from './components/ClientDashboard';
import { ArtistDashboard } from './components/ArtistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { getSessionUser, setSessionUser } from './services/storage';
import { User } from './types';
import { Music, ArrowRight, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://muselink-backend-vzka.onrender.com';

// =========================
// MAPEO CORRECTO DE ROLES
// =========================
function mapRolIdToRole(rol_id: number): 'client' | 'artist' | 'admin' {
  switch (rol_id) {
    case 1: return 'client';
    case 2: return 'artist';
    case 3: return 'admin';
    default: return 'client';
  }
}

// =========================
// LOGIN / REGISTRO CORREGIDO
// =========================
const LoginScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<'client' | 'artist'>('client'); // ADMIN REMOVIDO
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRegistering) {
        if (!password || password.length < 3) {
          alert('La contraseña debe tener al menos 3 caracteres.');
          return;
        }

        if (role === 'client' && !phone) {
          alert('El número de teléfono es obligatorio.');
          return;
        }

        // backend espera "cliente" o "artista"
        const backendRole = role === 'client' ? 'cliente' : 'artista';

        const resp = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: name,
            email,
            password,
            role: backendRole
          }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || 'Error al registrarse');
          return;
        }

        const data = await resp.json();
        const apiUser = data.user;

        if (data.token) localStorage.setItem('authToken', data.token);

        const newUser: User = {
          id: String(apiUser.id),
          name: apiUser.nombre,
          email: apiUser.email,
          role: mapRolIdToRole(apiUser.rol_id),
          phone,
          credits: role === 'artist' ? 3 : 0,
          password: '',
        };

        onLogin(newUser);

      } else {
        // ======================
        // LOGIN CORREGIDO
        // ======================
        const resp = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || 'Credenciales incorrectas');
          return;
        }

        const data = await resp.json();
        const apiUser = data.user;

        if (data.token) localStorage.setItem('authToken', data.token);

        const loggedUser: User = {
          id: String(apiUser.id),
          name: apiUser.nombre,
          email: apiUser.email,
          role: mapRolIdToRole(apiUser.rol_id), // USAR SOLO EL ROL DEL BACKEND
          phone: undefined,
          credits: mapRolIdToRole(apiUser.rol_id) === 'artist' ? 3 : 0,
          password: '',
        };

        onLogin(loggedUser);
      }
    } catch (error) {
      console.error('Error en auth:', error);
      alert('No se pudo conectar al servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md bg-surface/50 backdrop-blur-lg border border-slate-700 p-8 rounded-2xl shadow-2xl">

        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">

          {/* Selector corregido (SOLO client/artist) */}
          <div className="flex bg-slate-900 p-1 rounded-lg mb-6">
            <button type="button"
              className={`flex-1 py-2 px-2 ${role === 'client' ? 'bg-secondary text-white' : 'text-slate-400'}`}
              onClick={() => setRole('client')}
            >Cliente</button>

            <button type="button"
              className={`flex-1 py-2 px-2 ${role === 'artist' ? 'bg-primary text-white' : 'text-slate-400'}`}
              onClick={() => setRole('artist')}
            >Artista</button>
          </div>

          {/* Email */}
          <input type="email" required placeholder="Correo"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
            value={email} onChange={e => setEmail(e.target.value)} />

          {/* Password */}
          <input type="password" required placeholder="Contraseña"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
            value={password} onChange={e => setPassword(e.target.value)} />

          {/* Registro extra */}
          {isRegistering && (
            <>
              <input type="text" required placeholder="Nombre completo"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
                value={name} onChange={e => setName(e.target.value)} />

              {role === 'client' && (
                <input type="tel" required placeholder="Teléfono"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              )}
            </>
          )}

          <button type="submit"
            className="w-full py-3 mt-4 bg-secondary text-white font-bold rounded-lg">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-slate-400 underline">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿Nuevo en MuseLink?'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================
// APP PRINCIPAL
// =========================
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSessionUser();
    if (session) setUser(session);
  }, []);

  const handleLogin = (u: User) => {
    setSessionUser(u);
    setUser(u);
  };

  const handleLogout = () => {
    setSessionUser(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={
            user.role === 'client'
              ? <ClientDashboard user={user} />
              : user.role === 'artist'
              ? <ArtistDashboard user={user} />
              : <AdminDashboard />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;


