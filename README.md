# SEMS — Smart Energy Management System

SEMS is a full-stack energy tracking web application. It uses **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS**, **Express**, **MongoDB**, and **Mongoose**.

## Features

- Responsive homepage, account registration and login
- Session-based authentication with HTTP-only cookies
- Private energy readings (create, view, edit and delete)
- Dashboard with usage and electricity cost summaries
- Analytics, energy-saving recommendations, and searchable reports
- CSV report export and print-friendly report view

## Prerequisites

- Node.js and npm compatible with Next.js 16
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

From the project folder:

```bash
npm install
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your MongoDB connection string and a strong random `JWT_SECRET`. Never commit `.env` files or share credentials.

## Run locally

**Terminal 1 — API:**

```bash
cd backend
npm run dev
```

**Terminal 2 — website (from project root):**

```bash
npm run dev
```

Visit <http://localhost:3000>. The API is at <http://localhost:5001/api/health>.

If you use a different backend address, create a `.env.local` at the project root with `NEXT_PUBLIC_API_URL=http://localhost:5001` adjusted to your URL. Restart the Next.js server after changing environment variables.

## Commands

```bash
npm run lint
npm run build
```

The backend also supports `npm run check` and `npm start` from the `backend` directory.

## Routes

| Page | Purpose |
| --- | --- |
| `/` | Landing page |
| `/register` | Create account |
| `/login` | Sign in |
| `/dashboard` | Manage energy readings |
| `/analytics` | Analyze consumption |
| `/recommendations` | Energy-saving guidance |
| `/reports` | Filter, print and export readings |

## Notes

The application stores real user accounts and energy readings in MongoDB. The ZIP **does not** include a database or secret configuration. Set up the database and `.env` before running the backend on a new machine.

For public deployment, configure a secure HTTPS backend, allowed frontend origins, and appropriate cross-site cookie settings. The current configuration is intended for local development.
