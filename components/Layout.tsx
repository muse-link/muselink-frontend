import React from 'react';
import { User } from '../types';
import { LogOut, Music, User as UserIcon, Coins, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'artist': return 'Artista';
      case 'client': return 'Cliente';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 flex flex-col font-sans">
      <header className="bg-surface border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Music className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              MuseLink
            </h1>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <span className="text-sm text-slate-400 hidden sm:flex items-center">
                {user.role === 'admin' && <ShieldCheck className="w-4 h-4 mr-1 text-slate-300" />}
                Bienvenido/a, {user.name} ({getRoleLabel(user.role)})
              </span>
              
              {user.role === 'artist' && (
                <div className="flex items-center bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                  <Coins className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="font-bold text-yellow-500">{user.credits} Créditos</span>
                </div>
              )}

              <button 
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-surface border-t border-slate-700 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MuseLink. Conectando Artistas y Clientes.</p>
      </footer>
    </div>
  );
};