
# 🪹 EduNest – Full‑Stack Online Course Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-9.x-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-14.x-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
</p>

<br />

<div align="center">
  <h1>🪹 EduNest – Full‑Stack Online Course Marketplace</h1>
  <p><strong>Where learning builds a nest for your future.</strong></p>
</div>

---

## 📖 About The Project

**EduNest** is a complete platform for buying and selling educational courses – inspired by **SabzLearn**, Udemy, and modern Iranian e‑learning sites.  
It supports three user roles: **Student**, **Instructor**, and **Admin**.  
Built with **Node.js**, **Express**, **MongoDB** on the backend and **Next.js 14 (App Router)** + **Tailwind CSS** on the frontend.

> 🚀 This project started as a personal challenge to master full‑stack development and evolved into a production‑ready marketplace.

### ✨ Key Features

| Category | Features |
|----------|----------|
| 🔐 **Authentication** | JWT with role‑based access (user/instructor/admin), HTTP‑only cookies, protected routes |
| 🛒 **Course management** | Create, edit, publish courses; drag‑&‑drop curriculum builder; video upload |
| 📊 **Student experience** | Browse courses, search & filter, shopping cart, secure payment (Stripe), progress tracking, wishlist, reviews |
| 👨‍🏫 **Instructor panel** | Earnings dashboard, course analytics, student management |
| 🛠️ **Admin panel** | User management, course approval, comment moderation, sales reports |
| 🌐 **International** | Full Persian (RTL) support + English, dark/light theme, responsive design |

### 🚀 Extended Features (beyond basic requirements)

- 📝 Drag‑&‑drop curriculum builder (reorder sections & lessons)
- 🎥 Video progress tracking (resume where you left)
- 💬 Comment system with likes, replies, and instructor badge
- 📌 Wishlist & save for later
- 📧 Automated emails (welcome, purchase, password reset)
- 🔍 Full‑text search in Persian/English
- 🎨 Dark / Light theme with next‑themes
- 🛡️ Security: rate limiting, XSS protection, input validation

---

## 🧱 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,nextjs,react,tailwind,js,vercel" />
</p>

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 (App Router) · React 18 · JavaScript (ES2022) · Tailwind CSS · Shadcn/ui · Framer Motion · React Hook Form · Zod |
| **Backend**  | Node.js · Express.js · MongoDB (Mongoose) · JWT · bcryptjs · Nodemailer · Multer |
| **Payments** | Stripe (sandbox) + ready for local gateways |
| **Storage**  | Cloudinary / AWS S3 (videos & images) |
| **Deployment** | Vercel (frontend), Render / Railway (backend) · GitHub Actions |

---

## 🏗️ Architecture (MVC + REST API)
┌────────────────────────────────────────────────────┐
│ Presentation (View) │
│ Next.js App Router + Tailwind CSS │
└────────────────────────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────┐
│ API Layer (Controller) │
│ Express routes: auth, courses, orders, admin │
└────────────────────────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────┐
│ Model Layer (Mongoose) │
│ User · Course · Section · Lesson · Order · │
│ Review · Wishlist · Progress │
└────────────────────────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────┐
│ Database (MongoDB) │
│ Local (development) / Atlas (prod) │
└────────────────────────────────────────────────────┘

---

## 📁 Project Structure (Monorepo)

EduNest/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── controllers/      # business logic
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # auth, upload, error
│   │   ├── utils/            # JWT, email, etc.
│   │   └── config/           # DB & constants
│   ├── .env
│   ├── app.js
│   └── server.js
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # API calls, hooks
│   │   ├── styles/           # global CSS
│   ├── .env.local
│   └── next.config.js
├── .gitignore
└── README.md

🚀 Getting Started
Prerequisites
Node.js 18+ and npm/yarn/pnpm

MongoDB (local or Atlas)

Stripe account (for testing payments)

Cloudinary account (for video uploads)

Installation
Clone the repo


git clone https://github.com/MohamadRezaChaghomi/EduNest.git
cd EduNest
Backend setup

cd backend
npm install
cp .env.example .env
# edit .env with your credentials
Frontend setup

cd ../frontend
npm install
cp .env.local.example .env.local
# edit .env.local
Run development servers

# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
Open http://localhost:3000 🎉

🔐 Environment Variables
Backend (.env)

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edunest
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
Frontend (.env.local)

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
📡 API Endpoints (Examples)
Method	Endpoint	Description	Access
POST	/api/auth/register	Register new user	Public
POST	/api/auth/login	Login → JWT cookie	Public
GET	/api/auth/profile	Get user profile	Private
GET	/api/courses	Paginated course list	Public
GET	/api/courses/:id	Course details	Public
POST	/api/courses	Create course	Instructor
PUT	/api/courses/:id	Update course	Instructor
POST	/api/orders/checkout	Create order & payment	User
GET	/api/orders/my	User's order history	User
GET	/api/admin/users	All users	Admin
Full Postman collection available on request.

🧪 Development Notes
Challenges & Solutions
Challenge	Solution
🔤 Persian text in URLs	slugify with Unicode support
📦 Drag‑&‑drop curriculum	@dnd-kit/sortable + recursive state
🎬 Video progress tracking	Store watch time per lesson, aggregate on demand
🔒 Role‑based access	Middleware checking JWT payload on each request
⚡ Performance	Database indexes + Next.js ISR for course pages
Technical Decisions
✅ Next.js App Router – Better SEO & server components.

✅ Separate backend – Independent deployment & scaling.

✅ MongoDB – Flexible schema for dynamic course content.

✅ JWT in HTTP‑only cookies – More secure than localStorage.

✅ Tailwind + Shadcn/ui – Rapid UI development with consistent design.

📊 Current Status & Roadmap
Module	Status	Notes
🔐 Authentication	✅ Complete	Register, login, profile, logout
📚 Course CRUD	✅ Complete	Sections & lessons
👨‍🏫 Instructor panel	✅ Complete	Curriculum builder, video upload
🛒 Shopping cart	✅ Complete	Add/remove, quantity
💳 Payment (Stripe)	✅ Complete	Sandbox working
📈 User progress	✅ Complete	Watch time per lesson
💬 Reviews & ratings	✅ Complete	With admin approval
🛠️ Admin dashboard	🚧 In progress	Basic user & course management done
🔑 OAuth (Google)	⏳ Planned	NextAuth integration
💬 Real‑time chat	❌ Future	Not in initial scope
🎓 Project Context
Purpose – Portfolio project to demonstrate full‑stack skills for an e‑learning marketplace.

Inspiration – SabzLearn, Udemy, and leading Iranian platforms.

Timeline – Started March 2026, actively developed.

Role – Sole developer (architecture, frontend, backend, deployment).

🤝 Contributing
Contributions are welcome!

Fork the project

Create your feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

👤 Developer
MohamadReza Chaghomi

📧 mohamad.chaghomi@gmail.com

🐙 github.com/MohamadRezaChaghomi

🔗 EduNest on GitHub

🙏 Acknowledgements
Node.js · Express · MongoDB

Next.js · Tailwind CSS · Shadcn/ui

Stripe · Cloudinary

All amazing open‑source contributors

<p align="center"> <i>Made with ❤️ and a lot of ☕ by MohamadReza</i><br/> <b>EduNest – Grow your knowledge, build your future.</b> </p> ```