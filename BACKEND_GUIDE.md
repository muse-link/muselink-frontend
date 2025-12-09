# Guía de Implementación del Backend (MuseLink)

Como esta es una aplicación web, necesitas un servidor para procesar los pagos de forma segura y guardar los datos en la base de datos SQL que acabamos de crear.

A continuación se detallan los scripts que debes poner en tu servidor (Node.js).

## 1. Instalación del Servidor

Crea una carpeta nueva fuera de este proyecto llamada `muselink-server` e instala las dependencias:

```bash
mkdir muselink-server
cd muselink-server
npm init -y
npm install express pg cors dotenv bcrypt jsonwebtoken uuid
```

## 2. Archivo de Conexión (`db.js`)

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ej: postgres://user:pass@host:5432/muselink
  ssl: { rejectUnauthorized: false } // Necesario para nubes como Render/Supabase
});

module.exports = pool;
```

## 3. Servidor Principal (`server.js`)

Este script maneja el registro, login y la compra de créditos.

```javascript
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// --- AUTENTICACIÓN ---

// Registro
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    // 1. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // 2. Insertar en DB
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash, name, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, credits",
      [email, hash, name, role, phone]
    );
    
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registrando usuario");
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(401).json("Usuario no encontrado");

    const validPass = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPass) return res.status(401).json("Contraseña incorrecta");

    // En producción: Aquí generarías un JWT Token
    res.json({
      id: user.rows[0].id,
      name: user.rows[0].name,
      role: user.rows[0].role,
      credits: user.rows[0].credits
    });
  } catch (err) {
    console.error(err);
  }
});

// --- CRÉDITOS Y TRANSACCIONES ---

// Comprar Créditos (Simulado - Post MercadoPago)
app.post('/credits/add', async (req, res) => {
  const { userId, amount, cost } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Añadir créditos al usuario
    await client.query(
      "UPDATE users SET credits = credits + $1 WHERE id = $2",
      [amount, userId]
    );

    // 2. Registrar Transacción
    const invoiceNum = `INV-${Date.now()}`;
    const trans = await client.query(
      "INSERT INTO transactions (user_id, amount_credits, total_cost, invoice_number) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, amount, cost, invoiceNum]
    );

    await client.query('COMMIT');
    res.json(trans.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json("Error procesando compra");
  } finally {
    client.release();
  }
});

// --- SOLICITUDES ---

// Obtener Solicitudes (Con Filtros)
app.get('/requests', async (req, res) => {
  try {
    const allRequests = await pool.query("SELECT * FROM music_requests ORDER BY created_at DESC");
    res.json(allRequests.rows);
  } catch (err) {
    console.error(err);
  }
});

app.listen(3000, () => {
  console.log("Servidor MuseLink corriendo en puerto 3000");
});
```

## 4. Conexión Frontend -> Backend

Finalmente, en tu proyecto Frontend (este proyecto), debes reemplazar el archivo `services/storage.ts` para que deje de usar `localStorage` y use `fetch`.

**Ejemplo de cómo cambiaría `services/storage.ts`:**

```typescript
// services/api.ts

const API_URL = "https://muselink-backend-vzka.onrender.com"; // O tu URL de la nube
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const getRequests = async () => {
  const res = await fetch(`${API_URL}/requests`);
  return res.json();
};
```
