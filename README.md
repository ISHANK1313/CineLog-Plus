<div align="center">

# 🎬 CineLog Plus
### Your Ultimate Personal Movie Companion & Streaming Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-green?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TMDB API](https://img.shields.io/badge/TMDB-API-01b4e4?style=for-the-badge&logo=themoviedatabase)](https://www.themoviedb.org/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify)](https://venerable-puffpuff-bb8dcc.netlify.app/)
[![Back4App](https://img.shields.io/badge/Back4App-Backend-000000?style=for-the-badge&logo=back4app)](https://cinelogplus-rg1240dl.b4a.run)

**Track, Discover, Organize & Watch Your Movie Journey**

[🚀 **Launch Live App**](https://venerable-puffpuff-bb8dcc.netlify.app) • [📡 **Backend API**](https://cinelogplus-rg1240dl.b4a.run)

</div>

---

## ✨ What Makes CineLog Plus Special?

**CineLog Plus** is the advanced evolution of the original CineLog project. It takes everything you loved about movie tracking and adds a **game-changing new feature: Live Streaming**.

Now you don't just find movies—you **watch** them.

### 🎯 Core Features

#### 🎥 **NEW: Live Movie Streaming**
*   **Instant Playback:** Watch movies directly within the app.
*   **One-Click Embeds:** Seamless integration for a frictionless viewing experience.

#### 🔍 Smart Search & Discovery
*   **Real-time Search:** Powered by the massive TMDB database.
*   **Trending & Popular:** Updated daily to show you what's hot worldwide.
*   **Deep Details:** Cast, crew, ratings, runtime, and high-quality posters.

#### 📝 Personal Watchlist
*   **Curate Your List:** Save movies you want to watch.
*   **Persistent Storage:** Backed by a robust PostgreSQL database (Supabase).
*   **Instant Feedback:** Add/remove items with a single click.

#### 🔐 Secure & Modern
*   **JWT Authentication:** Stateless, secure session management.
*   **Responsive Design:** "Vibe-coded" React frontend that looks stunning on mobile and desktop.
*   **Performance:** Optimized with caching and fast API responses.

---

## 🛠️ Tech Stack

### **Backend (Spring Boot REST API)**
*   **Spring Boot 3.x** → Enterprise Java framework
*   **Spring Security** → JWT authentication & authorization
*   **Spring Data JPA** → Database ORM layer
*   **PostgreSQL** → Production database (Supabase)
*   **RestTemplate** → HTTP client for TMDB API
*   **Back4App** → Containerized Deployment

### **Frontend (React SPA)**
*   **React 18.2** → Component-based UI library
*   **Vite** → Fast build tool & dev server
*   **Tailwind CSS** → Utility-first styling
*   **Axios** → HTTP client for backend API
*   **Netlify** → Frontend hosting & CDN

---

## 📸 Screenshots

<div align="center">
  <img src="screenshots/homepage.png" alt="Home Page" width="45%">
  <img src="screenshots/movie-details.png" alt="Movie Details" width="45%">
</div>

---

## 🎬 How It Works

```mermaid
graph LR
    A[User] -->|Browser| B(React on Netlify)
    B -->|REST API| C{Spring Boot on Back4App}
    C -->|Auth| D[(PostgreSQL/Supabase)]
    C -->|Movie Data| E[TMDB API]
    C -->|Streaming| F[VidSrc Integration]
```

1.  **Sign Up/Login:** Users authenticate securely via JWT.
2.  **Browse:** The app fetches trending/popular movies from TMDB via the Spring Boot backend.
3.  **Details:** Clicking a movie retrieves deep details (runtime, genres, etc.).
4.  **Watch:** The **new streaming feature** fetches an embed link, allowing instant playback.
5.  **Watchlist:** Users save favorites to their personal list stored in Supabase.

---

## 📡 API Documentation

### Base URLs
*   **Production:** `https://cinelogplus-rg1240dl.b4a.run`
*   **Frontend:** `https://venerable-puffpuff-bb8dcc.netlify.app`

### 🔹 User Authentication

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/signup` | `POST` | Create a new user account |
| `/api/auth/login` | `POST` | Authenticate and receive JWT |

### 🔹 Movie Discovery (TMDB)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/movies` | `GET` | Search movies by query |
| `/api/trending` | `GET` | Get daily trending movies |
| `/api/popular` | `GET` | Get popular movies |
| `/api/movie/{id}` | `GET` | Get detailed movie information |

### 🔹 **New: Streaming**

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/movie/embed/{imdbId}` | `GET` | **Get the video embed URL for a movie** |

### 🔹 Watchlist (Protected)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/watchlist` | `GET` | Get user's personal watchlist |
| `/watchlist` | `POST` | Add a movie to watchlist |
| `/watchlist/{id}` | `DELETE` | Remove a movie from watchlist |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
*   Java 17+
*   Node.js 16+
*   PostgreSQL
*   TMDB API Key

### 1. Backend Setup
```bash
git clone https://github.com/ISHANK1313/CineLog.git
cd CineLog

# Create src/main/resources/secrets.properties
# Add:
# tmdb.api.key=YOUR_TMDB_KEY
# vidsrc.key=YOUR_VIDSRC_KEY

./mvnw spring-boot:run
```

### 2. Frontend Setup
```bash
cd cinelog-frontend
npm install

# Create .env
# VITE_API_URL=http://localhost:8080

npm run dev
```

---

## ☁️ Deployment Guide

### **Backend on Back4App**
The backend is containerized and deployed on **Back4App Containers**.
*   **URL:** `https://cinelogplus-rg1240dl.b4a.run`
*   **Env Vars:** `TMDB_API_KEY`, `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `VIDSRC_KEY`

### **Frontend on Netlify**
The React frontend is hosted on **Netlify** for superior global performance.
*   **URL:** `https://venerable-puffpuff-bb8dcc.netlify.app`
*   **Env Vars:** `VITE_API_URL=https://cinelogplus-rg1240dl.b4a.run`

### **Database on Supabase**
Managed PostgreSQL database providing robust persistence for user data and watchlists.

---

<div align="center">

**Built with ❤️ by [ISHANK1313](https://github.com/ISHANK1313)**

*Frontend vibe-coded with Claude Sonnet 4.5*

⭐⭐ **Star this repo if you enjoy watching movies!** ⭐⭐

</div>
