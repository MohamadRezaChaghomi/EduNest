# 🪹 EduNest – Full‑Stack Online Course Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge" />
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
Built with **Node.js**, **Express**, **MongoDB** on the backend and **Next.js 14 (App Router)** + **Tailwind CSS** + **Shadcn/ui** on the frontend.

> 🚀 This project started as a personal challenge to master full‑stack development and evolved into a production‑ready marketplace with all features of a modern LMS.

### ✨ Key Features

| Category | Features |
|----------|----------|
| 🔐 **Authentication** | JWT with role‑based access (user/instructor/admin), HTTP‑only cookies, refresh tokens, OTP login, forgot password, account lock after 5 failed attempts, ban user with expiry |
| 🛒 **Course management** | Create, edit, publish courses; drag‑&‑drop curriculum builder (Sections & Lessons); video upload (Cloudinary) with auto duration; free preview lessons |
| 📊 **Student experience** | Browse courses, search & filter, shopping cart (localStorage), secure payment (Stripe), watch video progress tracking (resume), wishlist (future), reviews & ratings (with replies, likes, pin, official replies) |
| 👨‍🏫 **Instructor panel** | Dashboard with earnings stats, manage courses (CRUD), manage curriculum (Sections & Lessons), upload course cover & lesson videos, view enrolled students |
| 🛠️ **Admin panel** | User management (ban, role change, delete), course approval & publication, review moderation (approve, delete, pin, official), report management (resolve reports), ticket management (reply, change status), audit logs |
| 💬 **Interaction** | Comment system for courses and individual lessons (with replies & likes), support ticket system for enrolled courses, contact form with admin notification |
| 📦 **Additional** | Shopping cart (add/remove, clear, checkout), Stripe payment webhook, automatic enrollment after payment, RTL support, dark/light theme, responsive design |

### 🚀 Extended Features (beyond basic requirements)

- 📝 Drag‑&‑drop curriculum builder (reorder sections & lessons)
- 🎥 Video progress tracking (resume where you left)
- 💬 Comment system with likes, replies, and instructor badge (official reply)
- 📌 Pin important reviews (admin/instructor)
- 🛡️ Anti‑spam: max 3 reviews per course per day, edit review only within 30 minutes
- 📧 Automated emails (welcome, purchase, password reset)
- 🔍 Full‑text search in Persian/English
- 🎨 Dark / Light theme with next‑themes
- 🧾 Report inappropriate reviews (users can report, admin resolves)
- 🎫 Support ticket system for students (with status: open/in_progress/closed)
- 📊 Admin audit logs (all activities)
- 📈 Popular courses endpoint based on rating or enrollment

---

## 🧱 Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,nextjs,react,tailwind,js,vercel" />
</p>

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 (App Router) · React 18 · JavaScript (ES2022) · Tailwind CSS · Shadcn/ui · Framer Motion · React Hook Form · Zod |
| **Backend**  | Node.js · Express.js · MongoDB (Mongoose) · JWT · bcryptjs · Nodemailer · Multer |
| **Payments** | Stripe (sandbox) + ready for local gateways (Zarinpal, etc.) |
| **Storage**  | Cloudinary (images & videos) |
| **Deployment** | Vercel (frontend), Render / Railway (backend) · GitHub Actions |

---

## 🏗️ Architecture (MVC + REST API)

┌────────────────────────────────────────────────────┐
│ Presentation (View)                                 │
│ Next.js App Router + Tailwind CSS                   │
└────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│ API Layer (Controller)                              │
│ Express routes: auth, users, courses, sections,     │
│ lessons, reviews, lessonComments, orders, payment,  │
│ tickets, reports, contact, upload, admin            │
└────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│ Model Layer (Mongoose)                              │
│ User, Category, Course, Section, Lesson, Review,    │
│ LessonComment, Order, Ticket, Report, Contact,      │
│ RefreshToken, LoginAttempt, BannedUser, OTP, Log    │
└────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│ Database (MongoDB)                                  │
│ Local (development) / Atlas (prod)                  │
└────────────────────────────────────────────────────┘

---

## 📁 Project Structure (Monorepo)

EduNest/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── models/           # Mongoose schemas (14+ models)
│   │   ├── controllers/      # Business logic (14+ controllers)
│   │   ├── routes/           # API endpoints (14+ route files)
│   │   ├── middleware/       # auth, upload, requestInfo
│   │   ├── utils/            # email, sms, logger
│   │   └── config/           # db, cloudinary, stripe
│   ├── .env
│   ├── app.js
│   └── server.js
├── frontend/                  # Next.js application
│   ├── app/                  # App Router pages (auth, dashboard, admin, instructor, courses, cart, payment, about, contact)
│   ├── components/           # React components (ui, course, lesson, layout, cart, instructor, providers)
│   ├── lib/                  # api.js (50+ methods), utils
│   ├── hooks/                # useAuth
│   ├── styles/
│   ├── middleware.js         # route protection
│   ├── .env.local
│   └── next.config.js
├── .gitignore
└── README.md

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB (local or Atlas)
- Stripe account (for testing payments)
- Cloudinary account (for video uploads)

### Installation

1. **Clone the repo**

   git clone https://github.com/MohamadRezaChaghomi/EduNest.git
   cd EduNest

2. **Backend setup**

   cd backend
   npm install
   cp .env.example .env
   # edit .env with your credentials (see below)

3. **Frontend setup**

   cd ../frontend
   npm install
   cp .env.local.example .env.local
   # edit .env.local

4. **Run development servers** (two terminals)

   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev

5. Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔐 Environment Variables

### Backend (`.env`)

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edunest
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from Stripe CLI or dashboard
CLIENT_URL=http://localhost:3000

### Frontend (`.env.local`)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

---

## 📡 API Endpoints (Examples)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login → JWT cookie | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| GET | `/api/courses` | Paginated course list (public) | Public |
| GET | `/api/courses/popular` | Popular courses | Public |
| GET | `/api/courses/admin/all` | All courses (admin) | Admin |
| POST | `/api/courses` | Create course | Instructor/Admin |
| PUT | `/api/courses/:id` | Update course | Owner/Admin |
| DELETE | `/api/courses/:id` | Delete course | Owner/Admin |
| POST | `/api/courses/:courseId/sections` | Create section | Instructor/Admin |
| POST | `/api/sections/:sectionId/lessons` | Create lesson | Instructor/Admin |
| POST | `/api/upload/courses/:courseId/cover` | Upload cover | Instructor/Admin |
| POST | `/api/upload/lessons/:lessonId/video` | Upload video | Instructor/Admin |
| GET | `/api/reviews/course/:courseId` | Get course reviews | Public |
| POST | `/api/reviews` | Create review | Enrolled student |
| POST | `/api/reviews/:id/like` | Like/unlike review | Private |
| POST | `/api/lesson-comments` | Create lesson comment | Enrolled student |
| GET | `/api/cart` | (handled client-side) | - |
| POST | `/api/payment/create-checkout-session` | Stripe checkout | Private |
| POST | `/webhook/stripe` | Stripe webhook | Public (Stripe) |
| GET | `/api/orders/my` | User orders | Private |
| POST | `/api/tickets` | Create support ticket | Enrolled student |
| PUT | `/api/tickets/:id/status` | Change ticket status | Instructor/Admin |
| POST | `/api/reports` | Report a review | Private |
| GET | `/api/admin/users` | List users (admin) | Admin |
| GET | `/api/admin/logs` | Audit logs | Admin |

> Full Postman collection available on request.

---

## 🧪 Development Notes

### Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| 🔤 Persian text in URLs | slugify with Unicode support |
| 📦 Drag‑&‑drop curriculum | @dnd-kit/sortable + recursive state |
| 🎬 Video progress tracking | Store watch time in localStorage, aggregate on demand |
| 🔒 Role‑based access | Middleware checking JWT payload on each request |
| ⚡ Performance | Database indexes + Next.js ISR for course pages |
| 🛡️ Spam reviews | Limit 3 reviews per course per 24h; edit window 30min |
| 🧾 Webhook idempotency | Check order existence before processing |

### Technical Decisions

- ✅ **Next.js App Router** – Better SEO & server components.
- ✅ **Separate backend** – Independent deployment & scaling.
- ✅ **MongoDB** – Flexible schema for dynamic course content.
- ✅ **JWT in HTTP‑only cookies** – More secure than localStorage.
- ✅ **Tailwind + Shadcn/ui** – Rapid UI development with consistent design.
- ✅ **Cloudinary** – Automatic video duration extraction & transformation.

---

## 📊 Current Status & Roadmap

| Module | Status | Notes |
|--------|--------|-------|
| 🔐 Authentication | ✅ Complete | Register, login, OTP, forgot password, logout all devices, refresh token |
| 📚 Course CRUD | ✅ Complete | Sections & lessons, video upload, cover upload |
| 👨‍🏫 Instructor panel | ✅ Complete | Dashboard, course management, curriculum builder (sections/lessons), video upload |
| 🛒 Shopping cart | ✅ Complete | Add/remove, clear, localStorage persistence |
| 💳 Payment (Stripe) | ✅ Complete | Checkout session, webhook, automatic enrollment |
| 📈 User progress | ✅ Complete | Watch time per lesson (localStorage) |
| 💬 Reviews & ratings | ✅ Complete | Main reviews, replies, likes, pin, official, admin approval, anti‑spam, edit within 30min |
| 📝 Lesson comments | ✅ Complete | Comments per lesson (replies, likes, admin approval) |
| 🎫 Support tickets | ✅ Complete | Create ticket for enrolled courses, messages, status management (instructor/admin) |
| 🧾 Report reviews | ✅ Complete | Users can report reviews; admin resolves (delete/reject) |
| 📞 Contact us | ✅ Complete | Form submission stored, admin can mark as read |
| 🛠️ Admin dashboard | ✅ Complete | User, course, review, report, ticket, log management |
| 🏠 Homepage | ✅ Complete | Hero, categories, popular courses, latest courses, stats |
| 🔑 OAuth (Google) | ⏳ Planned | NextAuth integration |
| 💬 Real‑time chat | ❌ Future | Not in initial scope |
| 📱 Mobile app | ❌ Future | Not in initial scope |

---

## 🎓 Project Context

- **Purpose** – Portfolio project to demonstrate full‑stack skills for an e‑learning marketplace.
- **Inspiration** – SabzLearn, Udemy, and leading Iranian platforms.
- **Timeline** – Started March 2026, actively developed.
- **Role** – Sole developer (architecture, frontend, backend, deployment).

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Developer

**MohamadReza Chaghomi**

- 📧 mohamad.chaghomi@gmail.com
- 🐙 [github.com/MohamadRezaChaghomi](https://github.com/MohamadRezaChaghomi)
- 🔗 [EduNest on GitHub](https://github.com/MohamadRezaChaghomi/EduNest)

---

## 🙏 Acknowledgements

- Node.js · Express · MongoDB
- Next.js · Tailwind CSS · Shadcn/ui
- Stripe · Cloudinary
- All amazing open‑source contributors

<p align="center">
  <i>Made with ❤️ and a lot of ☕ by MohamadReza</i><br/>
  <b>EduNest – Grow your knowledge, build your future.</b>
</p>

---