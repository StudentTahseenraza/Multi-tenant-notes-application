import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import tenantsRoutes from './routes/tenants.js';
import { initializeDatabase } from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// =====================
// 🔹 MongoDB connection
// =====================
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-saas';

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    initializeDatabase();
  })
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// =====================
// 🔹 Middleware
// =====================
const allowedOrigins = [
  'http://localhost:5173', // local vite
  'http://localhost:3000', // local react
  'https://multi-tenant-notes-application.vercel.app', // your Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, req.body);
  next();
});

// =====================
// 🔹 Routes
// =====================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/tenants', tenantsRoutes);

// =====================
// 🔹 Error handling
// =====================
app.use((error, req, res, next) => {
  console.error('❌ Error:', error.message);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  });
});

// =====================
// 🔹 Start server
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
