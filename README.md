# Nexus Admin — Modern & Production-Ready Admin Dashboard Template

A cutting-edge, high-performance, and frontend-ready Admin Dashboard Template built with **React 18 + TypeScript**, **Vite**, **Tailwind CSS**, **TanStack Query v5**, **TanStack Table v8**, **Recharts**, **React Hook Form**, **Zod**, and **Sonner**.

![Nexus Admin Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80)

---

## 🚀 Features

### 1. 🔐 Authentication
- **Login Screen:** Email & password input with show/hide password toggle, "Remember me" option, quick demo-account autofill buttons (`Demo Admin`, `Demo Editor`), inline Zod error feedback, and simulated authentication toast.
- **Register Screen:** Full Name, Email, Password, Confirm Password validation with custom Zod refine rules, Terms & Conditions acceptance checkbox, and redirect to Login.

### 2. 🧭 Dashboard Layout & Shell
- **Responsive Collapsible Sidebar:**
  - Expanded and compact (icon-only) modes on Desktop.
  - Smooth mobile slide-over Drawer with overlay dismiss.
  - Active route glow and indicator, badge count tags.
  - User profile snippet with quick logout trigger in sidebar footer.
- **Header & Top Navbar:**
  - Dynamic route-aware **Breadcrumbs**.
  - **Global Command Search (Ctrl + K / ⌘K)**: Instant command palette for page navigation, theme toggling, and quick actions.
  - **Theme Toggle:** Supports **Dark**, **Light**, and **System** themes with persistent `localStorage` saving.
  - **Interactive Notifications Dropdown:** Unread counter badge, categorized event items (orders, alerts, system, users), and "Mark all as read" capability.
  - **User Profile Dropdown Menu:** Profile, Settings, Documentation, and Logout actions.

### 3. 📊 Main Dashboard Overview
- **KPI Metric Summary Cards:** Total Revenue, Active Users, Total Sales, and Conversion Rate with percentage trend indicators (+/-) and icon badges.
- **Interactive Revenue Area Chart:** Real-time Gross Revenue vs Net Profit with Monthly / Weekly filter toggles, gradients, and custom tooltips.
- **Audience Traffic Distribution Donut Chart:** Breakdown across Desktop, iOS, Android, and Tablet devices with interactive tooltips and legend.
- **Global Team Distribution Map:**
  - Full-width interactive geographic world map plotting all team members at exact coordinates.
  - Interactive avatar pins with live status indicators and pulsing effects for active members.
  - Hover tooltips and inspector side-panel with full address details, direct profile shortcuts (`/users/:id`), and Google Maps launcher.
  - Multi-criteria filters by **Role** (*Admin, Editor, Manager, Viewer*), **Status** (*Active, Pending, Inactive*), and live search.
  - Summary metrics bar: Regional Hub breakdown (Americas, EMEA, APAC), active nodes count, and total countries reached.
  - Dual Map Engine switch: **Vector Radar Map** and **OpenStreetMap Satellite/Tiles layer**.
  - Bottom quick-jump team directory carousel.
- **Sales by Category Bar Chart:** Actual sales vs monthly target quota comparisons.
- **Recent Activities Feed:** Latest team events and transactions with user avatars, status badges, and currency amounts.

### 4. 🗂️ CRUD Data Management Table (Users)
- Powered by `@tanstack/react-table` and `@tanstack/react-query`.
- **Search & Filter:** Global search input with instant filtering by name, email, and department; Role and Status dropdown filters.
- **Column Visibility:** Dynamic menu to show/hide table columns.
- **Multi-Column Sorting:** Ascending/descending sort with column header indicators.
- **Row Selection & Bulk Delete:** Select-all and individual checkbox selection with floating bulk delete button.
- **Pagination:** Page size selector (5, 10, 20, 50 rows), First/Prev/Next/Last navigation, and item count summaries.
- **Direct Navigation:** Click on any user avatar or name to jump into their full details page (`/users/:id`).
- **Action Modals:**
  - **View Details:** Quick link to `/users/:id`.
  - **Add Member:** Modal Form with Zod validation.
  - **Edit Member:** Pre-filled modal Form with reactive update mutations.
  - **Delete Member:** Confirmation `AlertDialog` ("Are you sure?") with instant cache invalidation and toast alert.

### 5. 👤 Comprehensive User Detail Page (`/users/:id`) & Interactive Map
- **Hero Profile Header:** Large avatar with real-time status ring, quick statistics ribbon (Email, Phone, City/Country Location, Joined Date, Last Active), verified badge, copy email shortcut, status toggling (Suspend / Activate), and Edit/Delete triggers.
- **Geographic Location & Interactive Map:**
  - Integrated OpenStreetMap canvas with Dark & Light theme adaptive styling.
  - Interactive zoom in/out, recenter to location, and floating user info overlay.
  - Coordinate chip display with one-click **"Copy Coordinates"** (`Lat/Lng`) feature.
  - Direct quick-launch action button: **"Open in Google Maps"**.
  - Detailed address breakdown (Street Address, City & Region, Coordinates).
- **Multi-Tab Architecture:**
  - **Overview & Personal Info:** Contact info (Phone, Email, Location, Bio), Organization metadata (Department, Job title, Employment type, Access level), and Geographic Location Map.
  - **Security & Access:** Interactive 2FA switch toggle, active login session tracker (with devices, IP, and remote session revocation simulation), and Role Permissions capability matrix.
  - **Audit Logs & Activity Trail:** Categorized filterable timeline (Auth, Edit, Security, System) displaying recent timestamps, action summaries, and origin IPs.
- **UX States:** Polished skeleton shimmers during async data fetching and clean Not Found / Error states.

### 6. 📝 Form & Input Showcase
- **Comprehensive Input Library:**
  - Text Input with prefix icons
  - Currency / Number Input with range constraints
  - Searchable Category Select dropdown
  - Date Picker input
  - Tier Selection Radio cards
  - Character-counted Textarea
  - **Drag & Drop File Upload Zone (Dropzone)** with file type validation, preview list, and removal
  - Switches & Toggles for 2FA and Email Notifications
  - Checkbox validation
- **Live Validated JSON Inspector:** Inspects and renders the sanitized JSON payload output in real-time upon form submission.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Routing** | [React Router DOM v6](https://reactrouter.com/) |
| **Async State & API** | [@tanstack/react-query v5](https://tanstack.com/query) |
| **Data Tables** | [@tanstack/react-table v8](https://tanstack.com/table) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) + CSS Design Tokens |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/) |
| **Forms & Validation**| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Data Visualization**| [Recharts](https://recharts.org/) |
| **Feedback Toast** | [Sonner](https://sonner.emilkowal.ski/) |

---

## 📂 Project Structure

```
src/
├── components/
│   ├── layout/          # DashboardLayout, Sidebar, Navbar, CommandPalette
│   ├── theme/           # ThemeProvider, ThemeToggle
│   └── ui/              # Button, Input, Table, Dialog, Sheet, Dropdown, etc.
├── features/
│   ├── auth/            # LoginPage, RegisterPage
│   ├── dashboard/       # OverviewPage (Charts, KPIs, Activity Feed)
│   ├── users/           # UserManagementPage (CRUD Table, Modals, Hooks, API)
│   └── showcase/        # FormShowcasePage (All inputs + Dropzone + Zod preview)
├── lib/
│   ├── mock-data.ts     # Initial dataset for users, metrics, and charts
│   ├── query-client.ts  # TanStack QueryClient configuration
│   └── utils.ts         # cn helper and formatters
├── routes/              # AppRoutes definition
├── types/               # TypeScript interfaces (User, Metrics, Form, etc.)
├── App.tsx              # App Root with Providers
├── main.tsx             # DOM mounting
└── index.css            # Tailwind directives and HSL CSS variables
```

---

## ⚙️ Environment Variables

This project uses Vite environment variables with full TypeScript type safety and validation via `src/config/env.ts`.

### Available Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_TITLE` | Application branding and browser title | `"Nexus Admin"` |
| `VITE_APP_DESCRIPTION` | Meta description for the application | `"Modern & Production-Ready Admin Dashboard Template"` |
| `VITE_APP_VERSION` | Application version displayed in sidebar | `"1.0.0"` |
| `VITE_API_BASE_URL` | Base endpoint URL for backend API requests | `"http://localhost:3000/api"` |
| `VITE_ENABLE_MOCK` | Toggle in-memory mock API (`true` / `false`) | `"true"` |
| `VITE_APP_ENV` | Application environment (`development` / `production`) | `"development"` |

---

## 🔌 Connecting to a Real Backend API

To replace mock data with your live REST or GraphQL backend, simply update `src/features/users/api/users-api.ts` and set `VITE_ENABLE_MOCK=false` in your `.env` file:

```typescript
import { env } from '@/config/env';

// Example connecting to real API endpoint:
export const usersApi = {
  getUsers: async (params: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await fetch(
      `${env.apiBaseUrl}/users?page=${params.page}&pageSize=${params.pageSize}&search=${params.search || ''}`
    );
    return response.json();
  },
  createUser: async (payload: UserFormData): Promise<User> => {
    const response = await fetch(`${env.apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  },
  // ... updateUser, deleteUser
};
```

All UI components, loading states, error toast handlers, and TanStack cache invalidation will work automatically!

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` template to create your local `.env` file:
```bash
cp .env.example .env
```

### 3. Run Locally in Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
