import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ClientDashboard } from './components/ClientDashboard';
import { ArtistDashboard } from './components/ArtistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { getSessionUser, setSessionUser } from './services/storage';
import { User } from './types';
import { Music, ArrowRight, Lock } from 'lucide-react';

// 👉 URL del backend (usa la env si existe, si no, la de Render)
const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://muselink-backend-vzka.onrender.com';

// Mapea el rol de la BD (rol_id) a lo que usa el frontend
function mapRolIdToRole(rol_id: number): 'client' | 'artist' | 'admin' {
  // OJO: esto asume que en tu tabla "roles":
  // 1 = cliente, 2 = artista, 3 = admin
  switch (rol_id) {
    case 1:
      return 'client';
    case 2:
      return 'artist';
    case 3:
      return 'admin';
    default:
      return 'client';
  }
}

// Mock Auth Component (pero ahora conectado al backend)
const LoginScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<'client' | 'artist' | 'admin'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRegistering) {
        // =============== REGISTRO ==================
        if (!password || password.length < 3) {
          alert('La contraseña debe tener al menos 3 caracteres.');
          return;
        }
        if (role === 'client' && !phone) {
          alert('El número de teléfono es obligatorio para los clientes para que los artistas puedan contactarte.');
          return;
        }
        if (role === 'admin') {
          alert('No se pueden registrar administradores desde la interfaz pública.');
          return;
        }

        // role del backend en español
        const backendRole = role === 'client' ? 'cliente' : 'artista';

        const resp = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: name,
            email,
            password,
            role: backendRole,
          }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || 'Error al registrarse');
          return;
        }

        const data = await resp.json();

        // Guarda token aparte (lo usaremos después para rutas protegidas)
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        const apiUser = data.user;

        // Adaptar al tipo User que usa tu frontend
        const newUser: User = {
          id: String(apiUser.id),
          name: apiUser.nombre,
          email: apiUser.email,
          // el rol lo mapeamos desde rol_id
          role: mapRolIdToRole(apiUser.rol_id),
          phone: phone || undefined,
          // mantenemos credits como antes: artistas con 3 créditos iniciales
          credits: role === 'artist' ? 3 : 0,
          // password no la necesitamos después, pero la dejamos por tipo
          password: '',
        };

        onLogin(newUser);
      } else {
        // =============== LOGIN ==================
        const resp = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || 'Usuario o contraseña incorrectos');
          return;
        }

        const data = await resp.json();

        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        const apiUser = data.user;

        const loggedUser: User = {
          id: String(apiUser.id),
          name: apiUser.nombre,
          email: apiUser.email,
          role: mapRolIdToRole(apiUser.rol_id),
          // phone y credits no vienen del backend aún: los dejamos vacíos por ahora
          phone: undefined,
          credits: apiUser.role === 'artist' ? 3 : 0, // si quieres, luego lo sacamos de la BD
          password: '',
        };

        // Opcional: si quieres que el rol dependa de lo que eligió en el switch:
        // loggedUser.role = role;

        onLogin(loggedUser);
      }
    } catch (error) {
      console.error('Error en auth:', error);
      alert('No se pudo conectar con el servidor. Revisa el backend.');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    if (role === 'admin') setRole('client');
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface/50 backdrop-blur-lg border border-slate-700 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg">
            <Music className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {isRegistering ? 'Únete a MuseLink' : 'Bienvenido de nuevo'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          La mejor plataforma para talento musical.
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="flex bg-slate-900 p-1 rounded-lg mb-6 overflow-x-auto">
            <button
              type="button"
              className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                role === 'client' ? 'bg-secondary text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => {
                setRole('client');
                if (isRegistering && role === 'admin') setIsRegistering(false);
              }}
            >
              Cliente
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                role === 'artist' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => {
                setRole('artist');
                if (isRegistering && role === 'admin') setIsRegistering(false);
              }}
            >
              Artista
            </button>
            {!isRegistering && (
              <button
                type="button"
                className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  role === 'admin' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="******"
            />
            <Lock className="absolute right-3 top-9 w-4 h-4 text-slate-500" />
          </div>

          {isRegistering && (
            <>
              <div className="animate-in fade-in slide-in-from-top-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>

              {role === 'client' && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Teléfono <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                  <p className="text-xs text-slate-500 mt-1">Requerido para que los artistas te contacten.</p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-whiteפשר shadow-lg transform active:scale-95 transition-all mt-6 
              ${
                role === 'client'
                  ? 'bg-secondary hover:bg-cyan-400'
                  : role === 'artist'
                  ? 'bg-primary hover:bg-violet-500'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
          >
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}{' '}
            <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={toggleMode} className="text-sm text-slate-400 hover:text-white underline">
            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Nuevo en MuseLink? Regístrate'}
          </button>
        </div>
      </div>

      {/* Demo helper antiguo: puedes borrarlo si quieres */}
      {!isRegistering && (
        <div className="mt-8 text-xs text-slate-500 bg-black/40 p-4 rounded-lg border border-slate-800">
          <p className="font-bold mb-1">Ahora el login usa tu backend real ✨</p>
          <p>Puedes registrar clientes y artistas, y luego iniciar sesión con ese correo y contraseña.</p>
        </div>
      )}
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSessionUser();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
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

  const handleUpdateUser = (u: User) => {
    setUser(u);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-white">
        Cargando...
      </div>
    );

  const renderDashboard = () => {
    if (!user) return <Navigate to="/" />;
    switch (user.role) {
      case 'client':
        return <ClientDashboard user={user} />;
      case 'artist':
        return <ArtistDashboard user={user} onUpdateUser={handleUpdateUser} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <Router>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={renderDashboard()} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App;
