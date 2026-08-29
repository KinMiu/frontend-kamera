# Feature Request: Template Dashboard Admin Modern & Production-Ready (Frontend-Ready)

## 📌 Deskripsi Proyek
Tolong buatkan sebuah template Dashboard Admin modern dan production-ready (Mocked/Frontend-ready) dengan spesifikasi teknis, arsitektur, dan fitur berikut:

---

## 🛠️ Tech Stack & Library

- [ ] **Framework:** Next.js (App Router) atau Vite + React (TypeScript)
- [ ] **State Management & Data Fetching:**
  - `@tanstack/react-query` (untuk integrasi async state / API fetching siap pakai)
  - `@tanstack/react-table` (untuk tabel interaktif: sorting, pagination, search)
- [ ] **UI & Styling:**
  - Tailwind CSS
  - Shadcn UI / Radix UI (atau Lucide React icons)
- [ ] **Forms & Validation:**
  - React Hook Form + Zod (schema validation)
- [ ] **Charts:**
  - Recharts (Line/Area, Bar, Donut/Pie chart)
- [ ] **Feedback & Notifications:**
  - Sonner atau React Hot Toast (alert toast)
  - Modal / Dialog & AlertDialog untuk konfirmasi delete

---

## 📂 Struktur Halaman & Fitur yang Wajib Ada

### 1. 🔐 Authentication
- [ ] **Halaman Login:**
  - Form email & password
  - Remember me checkbox
  - Validation error UI
  - Submit simulation
- [ ] **Halaman Register:**
  - Form nama, email, password, konfirmasi password
  - Terms & conditions checkbox

### 2. 🧭 Layout Dashboard
- [ ] **Sidebar Responsif:**
  - Menu berjenjang / collapsible
  - Navigasi aktif (active route indicator)
  - Profil singkat di footer sidebar
  - Toggle collapse (desktop & mobile sheet)
- [ ] **Header / Top Navbar:**
  - Breadcrumbs
  - Search global bar
  - Theme Toggle (Dark / Light mode ready)
  - Notification badge dropdown
  - User Avatar dropdown (Profile, Settings, Logout)

### 3. 📊 Halaman Dashboard Utama (Overview)
- [ ] **KPI / Metric Summary Cards:**
  - Total Revenue, Active Users, Sales, Conversion Rate (dengan indikator naik/turun % + icon)
- [ ] **Area / Line Chart:**
  - Trend analitik mingguan / bulanan
- [ ] **Bar Chart:**
  - Perbandingan performa data
- [ ] **Mini Table / Activity Feed:**
  - Ringkasan aktivitas dan transaksi terbaru

### 4. 🗂️ Halaman CRUD Lengkap (Data Management / Table View)
- [ ] Menggunakan `@tanstack/react-table`
- [ ] **Fitur Table:**
  - Global / column search input
  - Filter dropdown
  - Column visibility toggle
  - Pagination control (Page size selector, Next / Prev / Page jumps)
  - Multi-column sorting
- [ ] **Tombol Action:**
  - **Add New:** Membuka Sheet/Modal Form input
  - **Edit:** Membuka Form dengan data pre-filled
  - **Delete:** Membuka Alert Dialog konfirmasi hapus ("Are you sure?")

### 5. 📝 Halaman Form & Input Showcase
- [ ] **Variasi Komponen Input:**
  - Text input & Number input
  - Textarea
  - Select / Combobox (Searchable Select)
  - Date Picker
  - File Upload zone / Dropzone
  - Checkbox & Radio Group
  - Switch / Toggle
- [ ] **Validasi:**
  - Integrasi Zod schema validation
  - Pesan error interaktif di bawah setiap field

---

## ⚙️ Ketentuan Arsitektur & Mock Data (Ready for API)

- [ ] **Struktur Folder Terorganisir:**
  - `/components/ui` (Komponen reusable / UI primitives)
  - `/features` atau `/modules` (Data fetching hooks, komponen per fitur/modul)
  - `/lib` (QueryClient setup, mock data, axios/fetch client placeholder, utils)
  - `/types` (TypeScript interfaces & types untuk user, table item, form payload)
- [ ] **Custom Hooks TanStack Query:**
  - Siapkan hook CRUD (contoh: `useGetUsers`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`)
  - Gunakan mock data berbasis `Promise` / `setTimeout` agar mudah diganti dengan endpoint API riil
- [ ] **Feedback Alert:**
  - Tampilkan feedback toast alert (Success / Error) saat trigger simulasi Add, Edit, dan Delete

---

## 🎯 Deliverables
- [ ] Struktur folder lengkap
- [ ] File konfigurasi (Tailwind, TypeScript, dll.)
- [ ] Kode lengkap untuk semua halaman, layout, dan komponen
