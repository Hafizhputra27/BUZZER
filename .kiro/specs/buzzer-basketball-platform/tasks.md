# Implementation Plan: Buzzer Basketball Platform

## Overview

Implementasi platform manajemen campaign buzzer media sosial berbasis React + Supabase. Stack: React.js + Vite + Tailwind CSS + Framer Motion (frontend), Supabase Auth/PostgreSQL/Edge Functions/Realtime (backend), SendGrid (email), Zustand (state), React Router v6 (routing), Vitest + React Testing Library + fast-check (testing).

## Tasks

- [x] 1. Setup project dependencies dan konfigurasi
  - [x] 1.1 Install frontend dependencies
    - Install: `react-router-dom`, `@supabase/supabase-js`, `zustand`, `framer-motion`, `react-hot-toast`
    - Install dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `jsdom`
    - Pastikan Tailwind CSS sudah terkonfigurasi di `frontend/tailwind.config.js` dan `frontend/src/index.css`
    - Tambahkan font `Outfit` dan `Inter` via Google Fonts di `frontend/index.html`
    - _Requirements: 8.4, 9.4_

  - [x] 1.2 Konfigurasi Vitest
    - Update `frontend/vite.config.js` untuk menambahkan konfigurasi test (environment: jsdom, setupFiles)
    - Buat `frontend/src/test/setup.ts` dengan import `@testing-library/jest-dom`
    - _Requirements: Testing Strategy_

  - [x] 1.3 Setup Supabase client
    - Buat `frontend/src/services/supabase.js` dengan inisialisasi Supabase client menggunakan env vars `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
    - Buat `frontend/.env.example` dengan placeholder env vars
    - _Requirements: 1.7_

  - [x] 1.4 Setup Zustand stores
    - Buat `frontend/src/store/authStore.js` dengan state: `user`, `role`, `session`, actions: `setUser`, `clearUser`
    - Buat `frontend/src/store/campaignStore.js` dengan state: `campaigns`, actions: `setCampaigns`, `addCampaign`
    - _Requirements: 1.3_

- [x] 2. Database schema dan RLS policies
  - [x] 2.1 Buat SQL migration untuk schema database
    - Buat `backend/supabase/migrations/001_initial_schema.sql` dengan tabel: `users`, `campaigns`, `assignments`, `submissions`
    - Sertakan semua constraints, foreign keys, dan UNIQUE constraint pada `(campaign_id, buzzer_id)` di tabel `assignments`
    - _Requirements: 2.2, 3.2, 6.2, 3.6_

  - [x] 2.2 Buat SQL untuk RLS policies
    - Buat `backend/supabase/migrations/002_rls_policies.sql` dengan semua RLS policies untuk tabel `users`, `campaigns`, `assignments`, `submissions`
    - _Requirements: 5.1, 8.1 (design)_

- [x] 3. Utility functions dan TypeScript types
  - [x] 3.1 Buat type definitions
    - Buat `frontend/src/types/index.js` (atau `.ts`) dengan types: `User`, `Campaign`, `Assignment`, `Submission`, `CampaignInput`, `StatsData`
    - _Requirements: 1.7, 2.2, 3.2, 6.2_

  - [x] 3.2 Implementasi fungsi validasi
    - Buat `frontend/src/utils/validators.js` dengan fungsi: `isValidUrl(url)`, `validateCampaignForm(input)`, `calculateProgress(approved, total)`, `computeStats(assignments)`
    - `isValidUrl`: return false jika kosong, whitespace, atau tidak dimulai dengan `http://` atau `https://`
    - `validateCampaignForm`: return `{ valid, errors }` — tolak jika title/description/deadline kosong atau hanya whitespace
    - `calculateProgress`: return `(approved / total) * 100`, return 0 jika total = 0
    - `computeStats`: hitung statistik dari array assignments
    - _Requirements: 2.5, 6.4, 10.1, 10.2_

  - [x] 3.3 Write property test untuk `validateCampaignForm`
    - **Property 4: Campaign form validation**
    - **Validates: Requirements 2.5**
    - Buat `frontend/src/utils/__tests__/validators.test.js`
    - Test: untuk setiap input dengan title kosong/whitespace, `validateCampaignForm` harus return `{ valid: false }`
    - Gunakan `fc.oneof(fc.constant(''), fc.stringOf(fc.constant(' ')))` untuk generate input invalid
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 4: Campaign form validation`

  - [x] 3.4 Write property test untuk `isValidUrl`
    - **Property 9: Submission URL validation**
    - **Validates: Requirements 6.4**
    - Test: untuk setiap string kosong, whitespace, atau tidak dimulai `http`, `isValidUrl` harus return false
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 9: Submission URL validation`

  - [x] 3.5 Write property test untuk `computeStats` dan `calculateProgress`
    - **Property 14: Statistik admin konsisten dengan data**
    - **Property 15: Progress bar konsisten dengan data assignment**
    - **Validates: Requirements 10.1, 10.2**
    - Test Property 14: untuk array assignments arbitrary, `computeStats(assignments).approvedSubmissions` harus sama dengan `assignments.filter(a => a.status === 'approved').length`
    - Test Property 15: untuk sembarang `approved` dan `total`, `calculateProgress(approved, total)` harus sama dengan `(approved / total) * 100`
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 14 & 15: Statistik konsisten dengan data`

- [x] 4. Checkpoint — Pastikan semua tests utility pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Auth system — komponen dan routing
  - [x] 5.1 Implementasi `ProtectedRoute` component
    - Buat `frontend/src/components/ProtectedRoute.jsx`
    - Jika tidak ada sesi aktif → redirect ke `/login`
    - Jika role tidak sesuai (buzzer akses admin route) → redirect ke `/dashboard/buzzer`
    - _Requirements: 1.4, 1.5_

  - [x] 5.2 Write property test untuk `ProtectedRoute`
    - **Property 2: Redirect ke login jika tidak ada sesi**
    - **Property 3: Buzzer tidak bisa akses Dashboard Admin**
    - **Validates: Requirements 1.4, 1.5**
    - Buat `frontend/src/components/__tests__/ProtectedRoute.test.jsx`
    - Test Property 2: render ProtectedRoute tanpa sesi → harus render redirect ke `/login`
    - Test Property 3: render ProtectedRoute dengan role `buzzer` di path admin → harus redirect ke `/dashboard/buzzer`
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 2 & 3: Redirect logic`

  - [x] 5.3 Implementasi halaman Register
    - Buat `frontend/src/pages/RegisterPage.jsx`
    - Form fields: nama lengkap, email, password, pilihan role (Admin/Buzzer)
    - Panggil `supabase.auth.signUp()` lalu INSERT ke tabel `users`
    - Tampilkan error jika email sudah terdaftar
    - _Requirements: 1.1, 1.7_

  - [x] 5.4 Implementasi halaman Login
    - Buat `frontend/src/pages/LoginPage.jsx`
    - Form fields: email, password
    - Panggil `supabase.auth.signInWithPassword()`, fetch role dari tabel `users`, update authStore
    - Redirect ke dashboard sesuai role setelah login berhasil
    - Tampilkan pesan error deskriptif jika login gagal
    - _Requirements: 1.2, 1.3, 1.6_

  - [x] 5.5 Write property test untuk role-based redirect
    - **Property 1: Role-based redirect setelah login**
    - **Validates: Requirements 1.3**
    - Buat `frontend/src/pages/__tests__/LoginPage.test.jsx`
    - Test: untuk setiap user dengan role `admin`, setelah login berhasil URL harus mengandung `/dashboard/admin`; untuk role `buzzer` harus mengandung `/dashboard/buzzer`
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 1: Role-based redirect setelah login`

  - [x] 5.6 Setup React Router dan App.jsx
    - Update `frontend/src/App.jsx` dengan semua routes: `/`, `/login`, `/register`, `/dashboard/admin`, `/dashboard/admin/campaigns/:id`, `/dashboard/buzzer`, `/dashboard/buzzer/assignments/:id`
    - Wrap protected routes dengan `ProtectedRoute`
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 6. Landing Page
  - [x] 6.1 Implementasi Landing Page
    - Update `frontend/src/pages/Landing.jsx`
    - Navbar: logo `logobuzzer.png` di kiri atas, link Login/Register di kanan
    - Hero section: background bertema basketball, headline "Smart Buzzer Campaign Management Platform", dua CTA button ("Start Campaign" → `/register?role=admin`, "Join as Buzzer" → `/register?role=buzzer`)
    - Features section: 4 card fitur (Campaign Distribution, Email Automation, Real-time Tracking, Buzzer Management)
    - Gunakan Framer Motion `motion.div` dengan `initial`, `animate`, `transition` untuk entrance animation pada hero section
    - Warna: `#1a73e8` (primary), `#040d1a` (dark), putih
    - Responsif: mobile (min 375px) dan desktop
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.4, 9.5_

- [x] 7. Admin Dashboard — layout dan stats
  - [x] 7.1 Implementasi AdminLayout
    - Buat `frontend/src/layouts/AdminLayout.jsx`
    - Sidebar/navbar dengan navigasi: Dashboard, Campaigns
    - Tombol logout yang memanggil `supabase.auth.signOut()` dan clear authStore
    - _Requirements: 1.4_

  - [x] 7.2 Implementasi StatsCards component
    - Buat `frontend/src/components/StatsCards.jsx`
    - Tampilkan 4 kartu: jumlah campaign aktif, total assignment, jumlah buzzer aktif, jumlah submission approved
    - Fetch data dari Supabase dan hitung menggunakan `computeStats`
    - Subscribe ke Supabase Realtime untuk update otomatis tanpa refresh
    - Gunakan glassmorphism style (background semi-transparan + backdrop-filter blur)
    - _Requirements: 10.1, 10.3, 9.2_

- [x] 8. Admin Dashboard — Campaign management
  - [x] 8.1 Implementasi CampaignList component
    - Buat `frontend/src/components/CampaignList.jsx`
    - Tampilkan daftar semua campaigns dengan: judul, deadline, progress bar
    - Progress bar menggunakan `calculateProgress(approvedCount, totalAssigned)`
    - Link ke halaman detail campaign
    - _Requirements: 2.3, 10.2_

  - [x] 8.2 Implementasi CampaignForm component (modal)
    - Buat `frontend/src/components/CampaignForm.jsx`
    - Form fields: judul, deskripsi/brief, deadline
    - Validasi menggunakan `validateCampaignForm` sebelum submit
    - Tampilkan inline validation message jika field kosong
    - Simpan ke tabel `campaigns` via Supabase, update campaignStore
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 8.3 Implementasi AdminDashboard page
    - Update atau buat `frontend/src/pages/Dashboard.jsx` (admin version)
    - Gabungkan StatsCards + CampaignList + tombol "Buat Campaign" yang membuka CampaignForm modal
    - _Requirements: 2.1, 2.3, 10.1_

- [x] 9. Admin Dashboard — Campaign detail dan assign buzzer
  - [x] 9.1 Implementasi AssignBuzzerModal component
    - Buat `frontend/src/components/AssignBuzzerModal.jsx`
    - Fetch daftar users dengan role `buzzer` dari Supabase
    - Filter out buzzer yang sudah di-assign ke campaign ini (gunakan prop `alreadyAssigned`)
    - Checkbox multi-select untuk memilih buzzer
    - Saat submit: INSERT ke tabel `assignments`, lalu panggil Edge Function `send-assignment-email` untuk setiap buzzer
    - Tampilkan toast error jika buzzer sudah ditugaskan (duplikasi)
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

  - [x] 9.2 Write property test untuk uniqueness constraint assignment
    - **Property 5: Uniqueness constraint assignment**
    - **Validates: Requirements 3.6**
    - Buat `frontend/src/components/__tests__/AssignBuzzerModal.test.jsx`
    - Test: mock Supabase insert — untuk pasangan (campaign_id, buzzer_id) yang sama, insert kedua harus return error
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 5: Uniqueness constraint assignment`

  - [x] 9.3 Implementasi CampaignDetail page
    - Buat `frontend/src/pages/CampaignDetail.jsx`
    - Tampilkan detail campaign: judul, deskripsi, deadline
    - Tampilkan AssignmentList: daftar buzzer yang ditugaskan beserta status submission
    - Tombol "Assign Buzzer" yang membuka AssignBuzzerModal
    - _Requirements: 2.4, 3.1_

- [x] 10. Admin Dashboard — Submission review
  - [x] 10.1 Implementasi SubmissionReviewList component
    - Buat `frontend/src/components/SubmissionReviewList.jsx`
    - Tampilkan daftar submissions dengan status `pending` yang menunggu review
    - Tampilkan link posting (clickable) untuk verifikasi konten
    - Tombol "Approve": UPDATE `submissions.status` → `approved` DAN `assignments.status` → `approved`
    - Tombol "Reject": UPDATE `submissions.status` → `rejected` DAN `assignments.status` → `pending`
    - Tampilkan riwayat semua submissions (approved, rejected, pending) per campaign
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 10.2 Write unit test untuk approve/reject logic
    - **Property 12: Approve mengupdate status submissions dan assignments**
    - **Property 13: Reject mengembalikan assignment ke pending**
    - **Validates: Requirements 7.3, 7.4**
    - Buat `frontend/src/components/__tests__/SubmissionReviewList.test.jsx`
    - Test Property 12: mock Supabase update — setelah approve, `submissions.status` = `approved` DAN `assignments.status` = `approved`
    - Test Property 13: mock Supabase update — setelah reject, `submissions.status` = `rejected` DAN `assignments.status` = `pending`
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 12 & 13: Approve/Reject status update`

- [x] 11. Checkpoint — Pastikan semua tests Admin Dashboard pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Buzzer Dashboard
  - [x] 12.1 Implementasi BuzzerLayout
    - Buat `frontend/src/layouts/BuzzerLayout.jsx`
    - Navbar dengan nama user dan tombol logout
    - _Requirements: 1.4_

  - [x] 12.2 Implementasi AssignmentCards component
    - Buat `frontend/src/components/AssignmentCards.jsx`
    - Fetch assignments WHERE `buzzer_id = auth.uid()` dari Supabase
    - Tampilkan untuk setiap assignment: judul campaign, deskripsi brief, deadline, status label (`Pending`, `Submitted`, `Approved`, `Rejected`)
    - Gunakan glassmorphism card style
    - Link ke halaman detail assignment
    - _Requirements: 5.1, 5.2, 5.3, 9.3_

  - [x] 12.3 Write property test untuk buzzer assignment filtering
    - **Property 8: Buzzer hanya melihat assignment miliknya**
    - **Validates: Requirements 5.1**
    - Buat `frontend/src/components/__tests__/AssignmentCards.test.jsx`
    - Test: mock Supabase query — semua assignment yang dikembalikan harus memiliki `buzzer_id` yang sama dengan user yang login
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 8: Buzzer hanya melihat assignment miliknya`

  - [x] 12.4 Implementasi BuzzerDashboard page
    - Buat atau update halaman buzzer dashboard yang menggabungkan AssignmentCards
    - _Requirements: 5.1, 5.2_

- [x] 13. Buzzer — Assignment detail dan submission
  - [x] 13.1 Implementasi SubmissionForm component
    - Buat `frontend/src/components/SubmissionForm.jsx`
    - Form field: URL link posting
    - Prop `disabled`: true jika status assignment adalah `submitted` atau `approved` — nonaktifkan input dan tombol submit
    - Validasi menggunakan `isValidUrl` sebelum submit
    - Tampilkan inline validation message jika URL kosong atau tidak valid
    - Saat submit: INSERT ke tabel `submissions`, lalu UPDATE `assignments.status` → `submitted`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 13.2 Write property test untuk SubmissionForm disabled state
    - **Property 11: Form submission dinonaktifkan setelah submitted/approved**
    - **Validates: Requirements 6.5**
    - Buat `frontend/src/components/__tests__/SubmissionForm.test.jsx`
    - Test: untuk setiap status `submitted` atau `approved`, form harus dalam kondisi disabled
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 11: Form submission dinonaktifkan`

  - [x] 13.3 Write property test untuk status assignment setelah submission
    - **Property 10: Status assignment terupdate setelah submission**
    - **Validates: Requirements 6.3**
    - Test: mock Supabase — setelah submission berhasil disimpan, `assignments.status` harus menjadi `submitted`
    - Tag komentar: `// Feature: buzzer-basketball-platform, Property 10: Status assignment terupdate setelah submission`

  - [x] 13.4 Implementasi AssignmentDetail page
    - Buat `frontend/src/pages/AssignmentDetail.jsx`
    - Tampilkan brief lengkap campaign (judul, deskripsi, deadline)
    - Render SubmissionForm dengan prop `disabled` berdasarkan status assignment
    - _Requirements: 5.4, 6.1_

- [x] 14. Email Service — Supabase Edge Function
  - [x] 14.1 Implementasi Edge Function `send-assignment-email`
    - Buat `backend/supabase/functions/send-assignment-email/index.ts`
    - Terima request body: `{ assignmentId, buzzerEmail, buzzerName, campaignTitle, campaignDescription, campaignDeadline }`
    - Kirim POST ke SendGrid API `/v3/mail/send` menggunakan `SENDGRID_API_KEY` dari env vars
    - Email subject harus mengandung judul campaign
    - Email body menggunakan template yang memuat: nama buzzer, judul campaign, deskripsi brief, deadline
    - Return `{ success: true }` atau `{ success: false, error: message }`
    - Jika SendGrid error: log error, return `{ success: false }` — jangan rollback assignment
    - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 14.2 Buat `backend/supabase/functions/send-assignment-email/deno.json`
    - Konfigurasi Deno untuk Edge Function
    - _Requirements: 4.3_

- [x] 15. Checkpoint — Pastikan semua tests pass dan integrasi berjalan
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Wiring dan integrasi akhir
  - [x] 16.1 Integrasi Realtime Supabase di AdminDashboard
    - Subscribe ke channel Supabase Realtime untuk tabel `assignments` dan `submissions`
    - Update StatsCards dan CampaignList secara otomatis saat ada perubahan data
    - _Requirements: 10.3_

  - [x] 16.2 Implementasi global error handling
    - Buat `frontend/src/components/ErrorBoundary.jsx` sebagai React Error Boundary
    - Setup `react-hot-toast` di `App.jsx` untuk toast notifications global
    - Pastikan semua Supabase query errors ditangkap dengan try/catch dan ditampilkan via toast
    - _Requirements: Error Handling (design)_

  - [x] 16.3 Verifikasi routing dan protected routes
    - Pastikan semua routes terdaftar di `App.jsx` dengan benar
    - Verifikasi ProtectedRoute bekerja untuk semua protected paths
    - Pastikan redirect setelah login/logout berjalan sesuai role
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 17. Final checkpoint — Pastikan semua tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Property tests menggunakan fast-check dengan minimum 100 iterasi per property
- Unit tests menggunakan Vitest + React Testing Library
- Supabase Edge Functions ditulis dalam TypeScript/Deno
- Env vars Supabase harus dikonfigurasi di `.env` sebelum menjalankan aplikasi
