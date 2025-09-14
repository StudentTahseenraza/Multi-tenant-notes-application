Multi-Tenant SaaS Notes Application
A secure, scalable, and fully-featured multi-tenant notes management application built with React, Node.js, and MongoDB, deployed on Vercel.


🌟 Features
🔐 Authentication & Authorization
JWT-based authentication with secure token management

Role-based access control (Admin & Member roles)

Pre-configured test accounts for easy testing

Secure password hashing with bcrypt

🏢 Multi-Tenancy Architecture
Strict tenant isolation with shared schema + tenant ID approach

Support for multiple companies/tenants (Acme & Globex included)

Scalable tenant management system

Tenant-specific data segregation

💰 Subscription Management
Free Plan: Limited to 3 notes per tenant

Pro Plan: Unlimited notes with all features

Admin-only upgrade endpoint

Real-time subscription updates

📝 Notes Management
Full CRUD operations (Create, Read, Update, Delete)

Rich text notes with titles and content

Tenant-specific note isolation

Real-time note limits enforcement

🚀 Deployment & Performance
Hosted on Vercel for optimal performance

CORS enabled for API accessibility

Health endpoint for monitoring

Optimized builds with Vite

🛠 Tech Stack
Frontend
React 18 - Modern UI library

Vite - Fast build tool and dev server

Axios - HTTP client for API calls

Context API - State management

CSS3 - Modern styling with Flexbox/Grid

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - NoSQL database

Mongoose - MongoDB object modeling

JWT - JSON Web Tokens for authentication

bcryptjs - Password hashing

CORS - Cross-origin resource sharing


🚀 Quick Start
Prerequisites
Node.js (v16 or higher)

MongoDB (local or Atlas)

Git

Installation
Clone the repository

bash
git clone <repository-url>
cd notes-saas-app
Set up the backend(api)


cd backend
npm install
Set up the frontend(src)

bash
cd ../frontend(src)
npm install
Environment Configuration

Create a .env file in the backend directory:

env
MONGODB_URI=mongodb://localhost:27017/notes-saas
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
PORT=5000
Create a .env file in the frontend directory:

env
VITE_API_URL=http://localhost:5000/api
Initialize the database with test data


# Start the backend server
cd backend
npm run dev

# In a new terminal, initialize test data
curl -X POST http://localhost:5000/api/auth/init
Start the development servers

ba
# Backend (runs on port 5000)
cd backend
npm run dev

# Frontend (runs on port 3000) - in a new terminal
cd frontend
npm run dev
Access the application

Open http://localhost:3000 in your browser

Use the test accounts to login

👥 Test Accounts
All accounts use the password: password

Email	Role	Tenant	Permissions
admin@acme.test	Admin	Acme	Full access, can upgrade subscription
user@acme.test	Member	Acme	Note management only
admin@globex.test	Admin	Globex	Full access, can upgrade subscription
user@globex.test	Member	Globex	Note management only
📡 API Endpoints
Authentication
POST /api/auth/login - User login

POST /api/auth/init - Initialize test data (development only)

Notes
GET /api/notes - Get all notes for current tenant

GET /api/notes/:id - Get specific note

POST /api/notes - Create new note

PUT /api/notes/:id - Update note

DELETE /api/notes/:id - Delete note

Tenants
POST /api/tenants/:slug/upgrade - Upgrade tenant subscription (Admin only)

Users
GET /api/users - Get all users for current tenant (Admin only)

Health
GET /health - Health check endpoint

🏗 Multi-Tenancy Implementation
Approach: Shared Schema with Tenant ID
We've implemented a shared schema with tenant ID column approach for multi-tenancy:

Advantages:

✅ Simplified maintenance - Single database to manage

✅ Cost-effective - Lower operational costs

✅ Easier scaling - Horizontal scaling with sharding

✅ Simplified backups - Single backup process

Implementation Details:

Tenant Isolation: All models include a tenantId field

Query Filtering: Middleware automatically filters all queries by tenant ID

Security: Strict validation ensures users can only access their tenant's data

Indexing: Proper indexing on tenantId for optimal performance

Data Models:

User: { email, password, role, tenantId }

Tenant: { name, slug, subscriptionPlan, noteLimit }

Note: { title, content, tenantId, createdBy }

🔒 Security Features
JWT Authentication with secure token storage

Password hashing using bcrypt (salt rounds: 12)

Role-based authorization middleware

Tenant isolation at the database query level

CORS configuration for controlled API access

Input validation and sanitization

Environment variables for sensitive configuration
