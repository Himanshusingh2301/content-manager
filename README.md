# ContentHub — Website Content Manager

A simple internal tool to store, compare, edit, and track website content across sections.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Auth**: JWT (stored in localStorage)

---

## Project Structure

```
content-manager/
├── client/     ← React frontend (Vite)
└── server/     ← Express backend
```

---

## Setup Instructions

### 1. MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user (username + password)
3. Whitelist your IP (Network Access → Add IP)
4. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### 2. Configure the Server

Edit `server/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/contentmanager?retryWrites=true&w=majority
JWT_SECRET=any_random_long_string_here
PORT=5000
```

### 3. Install & Run the Server

```bash
cd server
npm install
npm run dev
```

Server runs on http://localhost:5000

### 4. Install & Run the Client

```bash
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

### 5. Create Your First Admin User

The first user you create will need to be done via the API (or use a tool like Postman / Thunder Client):

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "you@company.com",
  "password": "yourpassword",
  "role": "admin"
}
```

After that, all new users are created from the **Admin → Manage Users** page inside the app.

---

## Features

| Feature | Description |
|---|---|
| Login / Auth | JWT-based, protected routes |
| Sections | Create / rename / delete content sections |
| Content Variants | Multiple versions of content per section |
| CRUD | Add, edit, delete any variant |
| Active Flag | Mark one variant as "Active/Live" |
| Compare | Side-by-side diff of any two variants |
| Edit History | Last 10 edits tracked per variant with restore |
| User Management | Admin can add/remove team members |

---

## Running in Production

1. Build the React app: `cd client && npm run build`
2. Serve `client/dist` from Express or deploy to Vercel/Netlify
3. Deploy Express server to Render / Railway / VPS
4. Set environment variables in your hosting dashboard
