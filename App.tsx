import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ClientDashboard } from './components/ClientDashboard';
import { ArtistDashboard } from './components/ArtistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { getSessionUser, setSessionUser, saveUser, getAllUsers } from './services/storage';
import { User } from './types';
import { Music, ArrowRight, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Mock Auth Component
const LoginScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [role, setRole] = useState<'client' | 'artist' | 'admin'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // New Password State
  const [phone, setPhone] = useState(''); // Essential for client
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      // REGISTRATION
      if (!password || password.length < 3) {
        alert("La contraseña debe tener al menos 3 caracteres.");
        return;
      }
      if(role === 'client' && !phone) {
        alert("El número de teléfono es obligatorio para los clientes para que los artistas puedan contactarte.");
        return;
      }
      if (role === 'admin') {
        alert("No se pueden registrar administradores desde la interfaz pública.");
        return;
      }

      // Check if email already exists
      const users = getAllUsers();
      if (users.some(u => u.email === email)) {
        alert("Este correo electrónico ya está registrado.");
        return;
      }

      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        password, // Save password
        role,
        phone: phone || undefined,
        credits: role === 'artist' ? 3 : 0 // Free credits for new artists to test
      };
      saveUser(newUser);
      onLogin(newUser);
    } else {
      // LOGIN
      const users = getAllUsers();
      const existing = users.find(u => u.email === email && u.role === role);
      
      if (existing) {
        // Validate Password
        if (existing.password === password) {
          onLogin(existing);
        } else {
          alert("Contraseña incorrecta. Inténtalo de nuevo.");
        }
      } else {
        alert("Usuario no encontrado. Por favor verifica tus credenciales o regístrate.");
        if (role !== 'admin') setIsRegistering(true);
      }
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
              className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${role === 'client' ? 'bg-secondary text-white shadow' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setRole('client'); if(isRegistering && role === 'admin') setIsRegistering(false); }}
            >
              Cliente
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${role === 'artist' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setRole('artist'); if(isRegistering && role === 'admin') setIsRegistering(false); }}
            >
              Artista
            </button>
            {!isRegistering && (
              <button
                type="button"
                className={`flex-1 py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap ${role === 'admin' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono <span className="text-red-400">*</span></label>
                  <input 
                    type="tel" 
                    required 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary outline-none"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                  <p className="text-xs text-slate-500 mt-1">Requerido para que los artistas te contacten.</p>
                </div>
              )}
            </>
          )}

          <button 
            type="submit" 
            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transform active:scale-95 transition-all mt-6 
              ${role === 'client' ? 'bg-secondary hover:bg-cyan-400' : 
                role === 'artist' ? 'bg-primary hover:bg-violet-500' : 
                'bg-slate-600 hover:bg-slate-500'}`}
          >
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'} <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={toggleMode} className="text-sm text-slate-400 hover:text-white underline">
            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Nuevo en MuseLink? Regístrate'}
          </button>
        </div>
      </div>
      
      {/* Demo helper */}
      {!isRegistering && (
        <div className="mt-8 text-xs text-slate-500 bg-black/40 p-4 rounded-lg border border-slate-800">
          <p className="font-bold mb-1">Credenciales de Demo (Usuario / Password):</p>
          <div className="grid grid-cols-1 gap-1">
            <span>Cliente: sofia@example.com / 123</span>
            <span>Artista: dave@rock.com / 123</span>
            <span className="text-yellow-500">Admin: admin@muselink.com / admin</span>
          </div>
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
  };

  // Keep UI user state in sync when credits update in storage
  const handleUpdateUser = (u: User) => {
    setUser(u);
  };

  if (isLoading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Cargando...</div>;

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