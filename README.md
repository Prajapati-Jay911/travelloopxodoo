# ✈️ Traveloop - Explore Horizons

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**Traveloop** is a premium, AI-powered travel-tech platform designed to elevate your journey planning experience. From intelligent itinerary building to seamless budget management, Traveloop provides all the tools you need to explore new horizons with confidence.

---

## 🔗 Project Links

| Resource | Link |
| :--- | :--- |
| **🚀 Live Demo** | [View Live Site](https://your-demo-link.com) |
| **📺 Video Walkthrough** | [Watch Demo Video](https://drive.google.com/drive/folders/1aZ8o0ghhVzKtPn4N7K2XS6lHX_p4TZvz?usp=sharing) |

---

## ✨ Key Features

-   **🤖 AI-Powered Itineraries:** Smart trip planning with curated stops and activities tailored to your preferences.
-   **💰 Smart Budget Tracking:** Real-time expense monitoring, billing, and automated invoice generation.
-   **🌍 Destination Explorer:** Discover world-class destinations with detailed cost indices and ratings.
-   **📊 Admin Dashboard:** Comprehensive analytics, user management, and platform oversight for administrators.
-   **💡 AI Insights:** Personalized travel tips, pro-tips, and real-time recommendations.
-   **🤝 Community Hub:** Share experiences and connect with fellow explorers.
-   **🌓 Premium UI/UX:** A sleek, light-themed design system with smooth animations and responsive layouts.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework:** Next.js 16 (App Router)
-   **Library:** React 19
-   **Styling:** Tailwind CSS 4, Vanilla CSS
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **Components:** Embla Carousel (for cinematic sliders)

### Backend
-   **Runtime:** Node.js
-   **ORM:** Prisma 7
-   **Database:** PostgreSQL
-   **Authentication:** JWT (JSON Web Tokens) with BcryptJS hashing
-   **Validation:** Zod

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Travelloopxoddo.git
    cd Travelloopxoddo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add the following (refer to `.env.example`):
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/traveloop"
    JWT_SECRET="your-super-secret-key"
    JWT_EXPIRES_IN="7d"
    NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
    ```

4.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    npm run prisma:seed
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & API Routes)
├── components/     # Reusable UI components
├── lib/            # Shared utilities, schemas (Zod), and API clients
├── prisma/         # Database schema and seed scripts
└── public/         # Static assets (images, logos)
```

---

## 📸 Screenshots

| Main Dashboard | Explore Destinations |
| :---: | :---: |
| ![Dashboard](./screenshorts/dashboard.png) | ![Explore](./screenshorts/explore.png) |

| My Trips | Admin Dashboard |
| :---: | :---: |
| ![My Trips](./screenshorts/mytrip.png) | ![Admin](./screenshorts/admin_dashboard.png) |

| Admin Login |
| :---: |
| ![Admin Login](./screenshorts/admin_login.png) |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by the Traveloop Team.
