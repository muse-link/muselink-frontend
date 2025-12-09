export type UserRole = 'client' | 'artist' | 'admin';

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

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Security field
  role: UserRole;
  phone?: string; // Critical for contact
  credits: number; // For artists
  bio?: string;
}

export interface MusicRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientContact: {
    email: string;
    phone: string;
  };
  title: string;
  genre: MusicGenre;
  description: string;
  budget: number;
  createdAt: number;
  
  // Logic fields
  maxOffers: number; // How many artists can unlock this
  unlockedBy: string[]; // Array of Artist IDs who bought the contact
  status: 'open' | 'closed';
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number; // Credits bought
  cost: number; // Total money spent
  date: number;
  invoiceNumber: string;
}

export interface SystemConfig {
  creditPrice: number; // Price per single credit
}