// ========================================================
// ROLES DEL SISTEMA
// ========================================================
export type UserRole = 'cliente' | 'artista' | 'admin';

// ========================================================
// GÉNEROS MUSICALES
// ========================================================
export enum MusicGenre {
  Pop = 'Pop',
  Rock = 'Rock',
  Jazz = 'Jazz',
  Classical = 'Clásica',
  Electronic = 'Electrónica',
  HipHop = 'Hip Hop',
  Latin = 'Latina',
  Folk = 'Folclore',
  Other = 'Otro'
}

// ========================================================
// USUARIO (MATCH 100% BACKEND POSTGRESQL)
// ========================================================
export interface User {
  id: number;               // PostgreSQL INTEGER
  nombre: string;           // En BD se llama "nombre"
  email: string;
  role: UserRole;
  phone?: string;
  credits: number;          // Créditos actuales del artista
}

// ========================================================
// SOLICITUD REAL DESDE EL BACKEND
// (Match EXACTO con la tabla solicitudes + desbloqueos)
// ========================================================
export interface Solicitud {
  id: number;
  cliente_id: number;

  titulo: string;
  descripcion: string;
  tipo_musica: string;

  fecha_evento: string | null;

  cantidad_ofertas: number;
  estado: string;

  fecha_creacion: string;

  desbloqueos: number;     // viene del LEFT JOIN COUNT()
}

// ========================================================
// ESTRUCTURA SOLO PARA CREAR SOLICITUD DESDE EL FRONTEND
// ========================================================
export interface NewSolicitudPayload {
  cliente_id: number;
  titulo: string;
  descripcion: string;
  tipo_musica: MusicGenre | string;
  cantidad_ofertas: number;
  fecha_evento?: string | null;
}

// ========================================================
// TRANSACCIÓN (opcional si luego quieres manejar créditos)
// ========================================================
export interface Transaction {
  id: string;
  userId: number;
  userName: string;
  amount: number;
  cost: number;
  date: number;
  invoiceNumber: string;
}
