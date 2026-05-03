# Innovault

Innovault is a modern MERN-stack platform designed for students and innovators to showcase, explore, and discover innovative projects within an institutional environment. It serves as a persistent institutional memory for innovation, preventing the loss of valuable project ideas across academic cohorts.

**Developed by:** Squad 456 (Neev Modi, Sai Charan Kumar, Venkata Charan)  
**Institution:** NIT Warangal (NITW)  
**Status:** Production Ready

---

## 🚀 Features

* **Secure Authentication:** JWT-based signup/login with OTP email verification and bcrypt password hashing.
* **Project Discovery:** Browse, search, and discover projects with advanced filtering and sorting.
* **Rating & Review System:** Community-driven ratings with verified vs. public review distinction.
* **Trending Dashboard:** Dynamically displays top-rated and most-viewed projects using custom algorithms.
* **Rich Media Support:** Seamless image uploads powered by Cloudinary with optimized storage.
* **Modern UI/UX:** Responsive, beautifully animated interfaces using React, Framer Motion, and Tailwind CSS.
* **High Performance:** Backend optimized with Redis caching and async event processing via QStash.
* **Institutional Security:** Domain-based role assignment (@nitw.ac.in = Verified user).
* **Data Persistence:** 5-year automatic data retention and archival policy.

---

## 🛠 Tech Stack

### Frontend
* Framework: React 18 (via Vite)
* Styling: Tailwind CSS with dark theme
* Animations: Framer Motion
* UI Components: Lucide React icons
* Routing: React Router v6
* Deployment: Vercel

### Backend
* Runtime: Node.js (v16+)
* Framework: Express.js
* Database: MongoDB with Mongoose ODM
* Caching: Redis (Upstash)
* Events: Upstash QStash
* Media Storage: Cloudinary + Multer
* Deployment: Render

---

## 🏗 Project Structure

```text
Innovault/
├── innovault/
│   ├── backend/
│   │   ├── server.js (Express server)
│   │   ├── config/ (Redis, QStash, Cloudinary)
│   │   ├── middleware/ (Auth, JWT, Validation)
│   │   ├── routes/ (Auth, Projects, Webhooks)
│   │   ├── models/ (Mongoose Schemas)
│   │   └── services/ (Redis cache logic)
│   └── frontend/
│       ├── src/
│       │   ├── pages/ (Home, Login, Explore, Dashboard, etc.)
│       │   ├── components/ (Navbar, Cards, Buttons)
│       │   └── context/ (AuthContext state)
└── README.md
```
---

## 🏁 Getting Started

### 1. Clone Repository
git clone https://github.com/NeevKumarModi2006/Innovault.git
cd Innovault

### 2. Backend Setup
cd innovault/backend
npm install

Create a .env file:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_url
SENDGRID_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_name

npm run dev

### 3. Frontend Setup
cd ../frontend
npm install

Create a .env file:
VITE_API_URL=http://localhost:5000/api

npm run dev

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | /api/auth/register | Create account with OTP |
| POST | /api/auth/login | Secure JWT-based login |
| GET | /api/projects | List projects with filters |
| POST | /api/projects | Create a new project |
| PUT | /api/projects/:id/bookmark | Toggle project bookmark |


---

## 📜 License
All rights reserved. This code is proprietary and may not be modified, copied, or distributed without explicit written permission from the authors (Squad 456).

**Last Updated:** April 4, 2024 | **Version:** 1.0 (Production Ready)
