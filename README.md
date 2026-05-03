# Smart Campus LMS

A production-level full-stack web application for university library management, student marketplace, and private chat.

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB (Local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file (pre-configured for you)
npm start # or npm run dev (if nodemon is installed)
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features
- **Admin**: Dashboard Analytics, Book Management, Category CRUD, Issue/Return Books.
- **Student**: Dashboard, Library Search/Filter, Marketplace Listings, Profile Management.
- **Real-time**: Private 1-to-1 Chat via Socket.IO.
- **UI/UX**: Premium Glassmorphism design with Tailwind CSS and Framer Motion.

## Project Structure
- `/backend`: Express API and Mongoose Models.
- `/frontend`: React (Vite) application with Tailwind CSS.
