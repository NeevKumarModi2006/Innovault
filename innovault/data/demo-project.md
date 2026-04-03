# Innovault Project Demo Data

Use this data to quickly fill out the "Submit Project" form during your presentation or testing.

---

### **Title**
`InnoVault: NITW Project Hub`

### **Short Description**
*(Max 200 chars)*
`A centralized platform for NITW students to showcase, discover, and rate academic and personal software projects. Features a dual-tier verification system and real-time MongoDB performance metrics.`

### **Tech Stack**
*(Copy and paste this exact comma-separated string)*
React, TailwindCSS, Vite, Node.js, Express, MongoDB, JWT, Nodemailer, Qstash, Redis

### **Deployment Link**
*(Can use localhost for demo if not deployed yet)*
`http://localhost:5173`

### **Source Link (GitHub)**
`https://github.com/NeevKumarModi2006/Innovault`

### **Detailed Description (Markdown)**
*(Copy and paste the entire block below into the rich text/markdown editor)*

```markdown
## Overview
**InnoVault** solves the common problem of lost or undiscovered brilliant university projects. It acts as an interactive digital archive where students can officially document their software engineering efforts.

### Core Architecture
- **Frontend**: A highly responsive, neon-dark themed React interface built with Vite and TailwindCSS. Includes debounced search, pagination, and a JWT-secured local state.
- **Backend**: A robust Express.js REST API with comprehensive security middlewares (`helmet`, `express-rate-limit`) and standard GZIP compression to reduce network payloads by ~70%.
- **Database**: Operated via Mongoose with a MongoDB Atlas cloud cluster. Features advanced query optimizations using compound indexing and TTL (Time-To-Live) indexes for ephemeral data like OTPs.

### Key Features
1. **Dual-Tier Review System**: Anyone can view and rate projects, but only verified `@nitw.ac.in` email accounts carry the "Verified Rating" badge, ensuring academic integrity.
2. **Secure Authentication**: End-to-end JWT authentication with live OTP email verification via Nodemailer and SMTP.
3. **Atomic Operations**: Database metrics, such as view counts and bookmarks, use atomic `$inc` operations to prevent race conditions under heavy load.

> *Built for the SEM-4 Software Engineering Course at NIT Warangal.*
```
