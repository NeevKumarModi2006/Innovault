# 🚀 Innovault

**Innovault** is a modern platform designed for developers and creators to showcase, explore, and discover innovative projects. Built with a powerful MERN-stack architecture, it features a sleek, animated user interface and a highly scalable backend equipped with caching, queuing, and secure media management.

---

## ✨ Features

- **Project Discovery:** Browse, search, and discover projects. 
- **Trending Projects:** Dynamically displays top-rated and most-viewed projects using a custom rating algorithm.
- **User Authentication:** Secure signup and login using JWT (JSON Web Tokens) and encrypted passwords (Bcrypt).
- **Rich Media & File Uploads:** Seamless image uploads powered by Cloudinary.
- **Modern UI/UX:** Responsive, beautifully animated interfaces using React, Framer Motion, and Tailwind CSS.
- **High Performance:** Backend optimized with Redis caching, Kafka for event streaming, and QStash for reliable message queuing.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (via Vite)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Content Rendering:** React Markdown

### Backend
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT & bcryptjs
- **Caching & Queues:** Redis, Kafka (KafkaJS), Upstash QStash
- **Media Storage:** Cloudinary & Multer
- **Security & Optimization:** Helmet, Express Rate Limit, Compression

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/) (Local or Upstash)
- Cloudinary Account (for image uploads)
- Kafka environment (optional depending on local setup)

### 1. Clone the repository
```bash
git clone https://github.com/NeevKumarModi2006/Innovault.git
cd Innovault
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd innovault/backend
npm install
```

Create a `.env` file in the `backend` directory and add your environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
REDIS_URL=your_redis_url
# Add Kafka and QStash variables as needed
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd innovault/frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```text
Innovault/
├── innovault/
│   ├── backend/
│   │   ├── server.js        # Entry point for the Express server
│   │   ├── package.json     # Backend dependencies and scripts
│   │   └── ...              # Controllers, routes, models, config
│   └── frontend/
│       ├── src/
│       │   ├── pages/       # React page components (e.g., Home, Explore, Login)
│       │   ├── components/  # Reusable UI components (e.g., ProjectCard)
│       │   ├── context/     # React context providers (e.g., AuthContext)
│       │   ├── services/    # API configuration (Axios)
│       │   └── App.jsx
│       ├── package.json     # Frontend dependencies and scripts
│       └── vite.config.js   # Vite configuration
```

---

## 🛑 Contributing & Usage

**This project is closed for external contributions and edits.** 

It is maintained solely by the repository owner. Pull requests, modifications, and unauthorized redistributions are not permitted. 

---

## 📝 License

**All rights reserved.** This code may not be modified, copied, or distributed by others without explicit permission from the author.
