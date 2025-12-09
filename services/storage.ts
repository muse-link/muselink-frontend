import { User, MusicRequest, MusicGenre, Transaction, SystemConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'muselink_users';
const REQUESTS_KEY = 'muselink_requests';
const TRANSACTIONS_KEY = 'muselink_transactions';
const CONFIG_KEY = 'muselink_config';
const CURRENT_USER_KEY = 'muselink_current_user';

// --- Initial Mock Data ---
const MOCK_USERS: User[] = [
  {
    id: 'client-1',
    name: 'Sofia Martinez',
    email: 'sofia@example.com',
    password: '123', // Demo password
    role: 'client',
    phone: '+1 555 0101',
    credits: 0
  },
  {
    id: 'artist-1',
    name: 'Dave Grohl (Clon)',
    email: 'dave@rock.com',
    password: '123', // Demo password
    role: 'artist',
    credits: 5, // Starts with credits
    bio: 'Baterista y guitarrista profesional.'
  },
  {
    id: 'admin-1',
    name: 'Administrador Sistema',
    email: 'admin@muselink.com',
    password: 'admin', // Demo password
    role: 'admin',
    credits: 0
  }
];

const MOCK_REQUESTS: MusicRequest[] = [
  {
    id: 'req-1',
    clientId: 'client-1',
    clientName: 'Sofia Martinez',
    clientContact: { email: 'sofia@example.com', phone: '+1 555 0101' },
    title: 'Busco Trío de Jazz para Boda',
    genre: MusicGenre.Jazz,
    description: 'Necesito un trío de jazz suave para la hora del cóctel. Preferiblemente Piano, Bajo y Batería.',
    budget: 500,
    createdAt: Date.now() - 86400000, // Yesterday
    maxOffers: 3,
    unlockedBy: [],
    status: 'open'
  }
];

const DEFAULT_CONFIG: SystemConfig = {
  creditPrice: 2.00 // Default $2.00 per credit
};

// --- Helpers ---

export const getSessionUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setSessionUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getAllUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  return JSON.parse(stored);
};

export const saveUser = (user: User): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update session if it's the current user
  const currentUser = getSessionUser();
  if (currentUser && currentUser.id === user.id) {
    setSessionUser(user);
  }
};

export const getRequests = (): MusicRequest[] => {
  const stored = localStorage.getItem(REQUESTS_KEY);
  if (!stored) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(MOCK_REQUESTS));
    return MOCK_REQUESTS;
  }
  return JSON.parse(stored);
};

export const saveRequest = (req: MusicRequest): void => {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === req.id);
  if (index >= 0) {
    requests[index] = req;
  } else {
    requests.push(req);
  }
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const deleteRequest = (id: string): void => {
  const requests = getRequests();
  const newRequests = requests.filter(r => r.id !== id);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(newRequests));
};

// --- Transaction & Config Logic ---

export const getSystemConfig = (): SystemConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  return JSON.parse(stored);
};

export const saveSystemConfig = (config: SystemConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const purchaseCredits = (userId: string, amount: number, totalCost: number): Transaction => {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) throw new Error("User not found");

  // Add credits
  user.credits += amount;
  saveUser(user);

  // Record Transaction
  const transaction: Transaction = {
    id: uuidv4(),
    userId: user.id,
    userName: user.name,
    amount,
    cost: totalCost,
    date: Date.now(),
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
  };

  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

  return transaction;
};

// --- Business Logic Helpers ---

export const buyContact = (artistId: string, requestId: string): boolean => {
  const users = getAllUsers();
  const requests = getRequests();

  const artist = users.find(u => u.id === artistId);
  const request = requests.find(r => r.id === requestId);

  if (!artist || !request) return false;
  if (artist.role !== 'artist') return false;
  if (artist.credits < 1) return false;
  if (request.unlockedBy.includes(artistId)) return true; // Already unlocked
  if (request.unlockedBy.length >= request.maxOffers) return false; // Full

  // Deduct credit
  artist.credits -= 1;
  saveUser(artist);

  // Add artist to unlocked list
  request.unlockedBy.push(artistId);
  saveRequest(request);

  return true;
};

// --- Database Export ---

export const exportDatabase = (): string => {
  const data = {
    users: getAllUsers(),
    requests: getRequests(),
    transactions: getTransactions(),
    config: getSystemConfig(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};