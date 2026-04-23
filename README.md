<div align="center">

<img src="https://img.shields.io/badge/CivicLens-AI%20Civic%20Platform-2369A4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==&logoColor=white" alt="CivicLens" />

# CivicLens AI

### AI-Powered Urban Issue Reporting & Analytics Platform

*Empowering citizens. Transforming cities. Powered by intelligence.*

<br/>

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-9553E9?style=flat-square)](https://inertiajs.com)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Models-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

<br/>

 [**Report Bug**](https://github.com/theelh/civiclens/issues) · [**Request Feature**](https://github.com/theelh/civiclens/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [AI Models](#-ai-models)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Web App Setup](#web-app-setup-laravel--react)
  - [Mobile App Setup](#mobile-app-setup-react-native--expo)
  - [Environment Variables](#environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

**CivicLens AI** is a full-stack, AI-powered civic issue reporting platform that bridges the gap between citizens and city authorities. Citizens can report urban problems — potholes, broken streetlights, illegal dumping, noise complaints — using **photos, voice recordings, or text**. Our AI pipeline automatically analyses each submission, classifies it, assesses severity, and generates structured reports for municipalities.

### The Problem

Cities receive thousands of unstructured citizen complaints daily that are:

- 📂 Hard to categorise and route to the right department
- ⏳ Slow to process and prioritise
- 📊 Impossible to analyse at scale for trend detection

### The Solution

CivicLens AI processes every report through a multi-model AI pipeline that handles:

| Task | Model | Output |
|---|---|---|
| Image understanding | BLIP (Vision) | Automatic photo caption |
| Issue classification | BART MNLI (Zero-shot) | Category + severity label |
| Voice transcription | Whisper Large v3 | Text from audio |
| Report summarisation | Llama 3.1 8B | 2–3 sentence summary |

---

## ✨ Features

### 👤 Citizen Portal (Web + Mobile)

- **📸 Multimodal Reporting** — Submit issues via photo, voice recording, or text
- **🤖 AI Auto-fill** — Category, severity, and description auto-populated from image analysis
- **📍 GPS Location Detection** — Auto-detect and reverse-geocode location
- **📊 Personal Dashboard** — Track all submitted reports with real-time status updates
- **🗺️ Interactive Map** — View all city reports on a live map with severity heatmaps
- **📈 Analytics** — Visualise personal stats, AI confidence scores, and category trends
- **🔔 Smart Notifications** — Get notified when AI analysis completes or report status changes
- **💬 AI Assistant** — Built-in chatbot powered by Llama 3.1 for platform Q&A

### 🏛️ Admin Control Centre

- **📋 Full Report Management** — View, assign, change status, re-analyse, or delete any report
- **👥 User Management** — Role assignment (admin/staff/citizen), ban/unban, impersonation
- **🤖 AI Monitoring Dashboard** — Track model confidence scores, failures, and category accuracy
- **📊 Platform Analytics** — City-wide trends, resolution rates, weekly submission charts
- **⚡ Inline Status Updates** — Change report status directly from the table without page reload

### 📱 Mobile App (React Native + Expo)

- Full feature parity with the web portal
- Native camera and voice recording integration
- Offline-first design with pull-to-refresh
- Full dark mode support
- Interactive map with custom severity pins and AI report cards

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Laravel 11 |
| Language | PHP 8.3 |
| Database | PostgreSQL 15 |
| Queue | Redis + Laravel Queues |
| Auth | Laravel Sanctum |
| File Storage | Laravel Storage (local / S3-compatible) |
| AI Integration | HuggingFace Inference API |

### Web Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| SSR Bridge | Inertia.js v2 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Maps | Leaflet.js |
| HTTP | Axios |

### Mobile App
| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 51 |
| Navigation | Expo Router (file-based) |
| Maps | react-native-maps |
| Location | expo-location |
| Camera | expo-image-picker |
| HTTP | Axios |

---

## 🤖 AI Models

All models are accessed via the [HuggingFace Inference API](https://huggingface.co/docs/inference-providers) — no local GPU required.

```
Image Captioning   →  Salesforce/blip-image-captioning-large
                       router.huggingface.co/models/...

Zero-shot Class.   →  facebook/bart-large-mnli
                       router.huggingface.co/models/...

Speech-to-Text     →  openai/whisper-large-v3
                       router.huggingface.co/models/...

Summarisation      →  meta-llama/Llama-3.1-8B-Instruct:cerebras
                       router.huggingface.co/v1/chat/completions

AI Assistant       →  meta-llama/Llama-3.1-8B-Instruct:cerebras
                       router.huggingface.co/v1/chat/completions
```

### AI Pipeline Flow

```
User submits report
       │
       ▼
┌──────────────────┐
│  Store Report    │  ← Save to DB, store media files
│  + Queue Job     │
└────────┬─────────┘
         │  async
         ▼
┌──────────────────────────────────────────┐
│           AnalyzeReportJob               │
│                                          │
│  1. BLIP      → Image caption            │
│  2. Whisper   → Audio transcription      │
│  3. BART      → Category classification  │
│  4. BART      → Severity detection       │
│  5. Llama 3.1 → Report summarisation     │
│  6. Save      → Update report + notify   │
└──────────────────────────────────────────┘
         │
         ▼
   Notification sent to citizen
   Report routed to municipality
```

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Web Browser   │    │   Mobile App    │    │   Admin Panel    │
│ React + Inertia │    │  React Native   │    │ React + Inertia  │
└────────┬────────┘    └────────┬────────┘    └────────┬─────────┘
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                │ HTTP / REST
                                ▼
                   ┌────────────────────────┐
                   │     Laravel 11 API     │
                   │  + Inertia.js Bridge   │
                   └────────────┬───────────┘
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
      │  PostgreSQL  │  │    Redis     │  │   Storage   │
      │   Database   │  │   Queue      │  │  (Media)    │
      └──────────────┘  └──────┬───────┘  └─────────────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │  AnalyzeReportJob      │
                   │  (Queue Worker)        │
                   └────────────┬───────────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │  HuggingFace Router    │
                   │  BLIP · BART · Whisper │
                   │  Llama 3.1             │
                   └────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+
- PostgreSQL 14+
- Redis
- A [HuggingFace](https://huggingface.co) account with an API token
- (Optional) Google Maps API key for mobile maps

---

### Web App Setup (Laravel + React)

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/civiclens.git
cd civiclens
```

**2. Install PHP dependencies**
```bash
composer install
```

**3. Install JS dependencies**
```bash
npm install
```

**4. Configure environment**
```bash
cp .env.example .env
php artisan key:generate
```

**5. Set up the database**
```bash
# Create your PostgreSQL database, then:
php artisan migrate --seed
```

**6. Link storage**
```bash
php artisan storage:link
```

**7. Start the queue worker**
```bash
php artisan queue:work redis --tries=3
```

**8. Build assets and start the dev server**
```bash
npm run dev
# In another terminal:
php artisan serve
```

Visit [http://localhost:8000](http://localhost:8000)

**Create an admin account**
```bash
php artisan tinker
# Then:
User::first()->update(['role' => 'admin']);
```

---

### Mobile App Setup (React Native + Expo)

```bash
cd mobile   # or wherever your Expo project lives
npm install

# Install native dependencies
npx expo install react-native-maps expo-location expo-image-picker \
  expo-av expo-linear-gradient react-native-safe-area-context
```

**Update the API base URL** in `services/api.ts`:
```ts
const BASE_URL = 'http://YOUR_LOCAL_IP:8000';
// Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
```

**Start the Expo dev server**
```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or run on a simulator:
```bash
npx expo run:ios      # iOS Simulator
npx expo run:android  # Android Emulator
```

---

### Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```env
# Application
APP_NAME="CivicLens AI"
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=civiclens
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Queue
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# HuggingFace (required for AI features)
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx

# Optional: AWS S3 for production file storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
```

---

## 📡 API Reference

All endpoints are prefixed with `/api` when using `routes/api.php`.

### Reports

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/reports` | List authenticated user's reports | ✅ |
| `POST` | `/reports` | Submit a new report | ✅ |
| `GET` | `/reports/{id}` | Get single report (includes `is_owner`) | ❌ |
| `POST` | `/reports/{id}` | Update report (`_method=PUT`) | ✅ |
| `DELETE` | `/reports/{id}` | Delete report | ✅ |
| `POST` | `/reports/{id}/analyze` | Queue AI analysis | ✅ |
| `POST` | `/reports/{id}/resolve` | Mark report resolved | ✅ |
| `GET` | `/map/reports` | All reports with coordinates (public) | ❌ |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications` | List notifications |
| `POST` | `/notifications/{id}/read` | Mark single as read |
| `POST` | `/notifications/{id}/unread` | Mark single as unread |
| `POST` | `/notifications/read-all` | Mark all as read |
| `DELETE` | `/notifications/{id}` | Delete single |
| `DELETE` | `/notifications/read` | Delete all read |

### Profile & Settings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/settings/profile` | Get current user profile |
| `PUT` | `/settings/profile` | Update name / email |
| `PUT` | `/settings/password` | Change password |
| `DELETE` | `/settings/profile` | Delete account |

### AI Chatbot

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/chatbot` | Send message to AI assistant | ❌ |

---

## 📁 Project Structure

```
civiclens/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AllReportsController.php     # Citizen report CRUD
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboardController.php
│   │   │   │   ├── AdminReportController.php
│   │   │   │   ├── AdminUserController.php
│   │   │   │   └── AdminAiController.php
│   │   │   ├── Api/ChatbotController.php    # AI assistant
│   │   │   ├── AnalyticsController.php
│   │   │   ├── MapController.php
│   │   │   └── NotificationController.php
│   │   └── Middleware/
│   │       └── AdminMiddleware.php
│   ├── Jobs/
│   │   └── AnalyzeReportJob.php             # 🤖 Core AI pipeline
│   └── Models/
│       ├── Report.php
│       ├── AiAnalysis.php
│       ├── Notification.php
│       ├── Location.php
│       ├── Category.php
│       └── Media.php
│
├── resources/
│   └── js/
│       └── pages/
│           ├── dashboard.tsx                # Citizen dashboard
│           ├── submitreport.tsx             # Report submission
│           ├── reports/
│           │   ├── index.tsx                # Report list
│           │   ├── show.tsx                 # Report detail
│           │   └── edit.tsx                 # Edit report
│           ├── analytics.tsx                # Charts & insights
│           ├── map.tsx                      # Interactive map
│           ├── notifications.tsx            # Notification centre
│           └── admin/
│               ├── dashboard.tsx
│               ├── reports.tsx
│               ├── users.tsx
│               └── ai-monitoring.tsx
│
├── mobile/                                  # Expo React Native app
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── submitReport.tsx
│   │   ├── reportDetails/[id].tsx
│   │   ├── reports/[id]/edit.tsx
│   │   ├── notifications.tsx
│   │   ├── profile.tsx
│   │   └── map.tsx
│   ├── components/
│   │   └── ChatbotFAB.tsx                  # Floating AI chat
│   ├── context/
│   │   └── AuthContext.tsx
│   └── services/
│       └── api.ts
│
├── routes/
│   ├── web.php                              # Inertia + web routes
│   └── api.php                             # Mobile API routes
│
└── database/
    └── migrations/
        ├── create_reports_table.php
        ├── create_locations_table.php
        ├── create_categories_table.php
        ├── create_media_table.php
        ├── create_ai_analyses_table.php
        ├── create_notifications_table.php
        └── add_role_to_users_table.php
```

---

## 🗺️ Roadmap

- [x] Multimodal report submission (image + audio + text)
- [x] AI pipeline (BLIP + BART + Whisper + Llama)
- [x] Citizen web dashboard with analytics
- [x] Interactive city map with heatmap
- [x] Admin control centre (reports + users + AI monitoring)
- [x] React Native mobile app with dark mode
- [x] AI chatbot assistant
- [x] Real-time notifications
- [ ] WebSocket real-time status updates
- [ ] Report export to PDF
- [ ] Department assignment workflow
- [ ] Public city-wide dashboard (no auth required)
- [ ] Email digest for unresolved reports
- [ ] Multi-language support (AR / FR / EN)
- [ ] Kubernetes deployment configuration

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    formatting only
refactor: code restructuring
test:     adding tests
chore:    build process or tooling
```

### Development Setup

```bash
# Run tests
php artisan test

# Run frontend type checks
npm run type-check

# Lint
npm run lint
php artisan pint
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [HuggingFace](https://huggingface.co) — AI model hosting and inference API
- [Salesforce BLIP](https://huggingface.co/Salesforce/blip-image-captioning-large) — Image captioning
- [Meta Llama 3.1](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct) — Text generation
- [OpenAI Whisper](https://huggingface.co/openai/whisper-large-v3) — Speech recognition
- [Facebook BART](https://huggingface.co/facebook/bart-large-mnli) — Zero-shot classification
- [Laravel](https://laravel.com), [React](https://react.dev), [Expo](https://expo.dev) — Application frameworks
- [Nominatim / OpenStreetMap](https://nominatim.org) — Free reverse geocoding

---

<div align="center">

**Built with ❤️ to make cities better**

*CivicLens AI — Report it. Analyze it. Fix it.*

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/civiclens?style=social)](https://github.com/theelh/civiclens)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/civiclens?style=social)](https://github.com/theelh/civiclens)

</div>
