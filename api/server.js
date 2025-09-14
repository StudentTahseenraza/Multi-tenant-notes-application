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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-saas';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    initializeDatabase();
  })
  .catch((error) => console.error('MongoDB connection error:', error));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://multi-tenant-notes-application-b1zj.vercel.app', // ✅ add your frontend deploy URL
    'https://multi-tenant-notes-application.vercel.app'       // ✅ if frontend & backend both on vercel
  ],
  credentials: true
}));

app.use(express.json());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/tenants', tenantsRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;