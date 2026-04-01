# Requirements Document

## Introduction

Buzzer Basketball adalah platform manajemen campaign buzzer media sosial berbasis web. Platform ini memungkinkan Admin untuk membuat campaign, menugaskan buzzer, dan memantau hasilnya — sementara Buzzer dapat melihat brief, mengerjakan tugas, dan mengirimkan bukti posting. Sistem secara otomatis mengirimkan notifikasi email ke buzzer saat ditugaskan. Platform dibangun dengan React.js + Tailwind CSS + Framer Motion di frontend, dan Supabase (Auth, Database, Edge Functions) di backend, dengan integrasi email via SendGrid.

---

## Glossary

- **Admin**: Pengguna dengan role `admin` yang memiliki akses penuh untuk membuat campaign, menugaskan buzzer, dan menyetujui/menolak submission.
- **Buzzer**: Pengguna dengan role `buzzer` yang menerima penugasan campaign dan mengirimkan bukti posting.
- **Campaign**: Paket kerja promosi yang berisi judul, deskripsi/brief, dan deadline.
- **Assignment**: Relasi antara satu Campaign dan satu Buzzer, beserta status pengerjaannya.
- **Submission**: Bukti kerja berupa link posting yang dikirimkan Buzzer untuk satu Assignment.
- **Auth_System**: Sistem autentikasi berbasis Supabase Auth yang mengelola login, register, dan sesi pengguna.
- **Email_Service**: Layanan pengiriman email otomatis berbasis Supabase Edge Function yang terintegrasi dengan SendGrid.
- **Dashboard_Admin**: Antarmuka web khusus Admin untuk manajemen campaign dan monitoring.
- **Dashboard_Buzzer**: Antarmuka web khusus Buzzer untuk melihat penugasan dan mengirimkan submission.
- **Landing_Page**: Halaman publik yang menampilkan informasi platform dan CTA untuk mendaftar.

---

## Requirements

### Requirement 1: Autentikasi dan Manajemen Role

**User Story:** Sebagai pengguna, saya ingin dapat mendaftar dan login dengan role yang sesuai, sehingga saya mendapatkan akses ke fitur yang relevan dengan peran saya.

#### Acceptance Criteria

1. THE Auth_System SHALL menyediakan halaman Register dengan field: nama lengkap, email, password, dan pilihan role (Admin atau Buzzer).
2. THE Auth_System SHALL menyediakan halaman Login dengan field email dan password.
3. WHEN pengguna berhasil login, THE Auth_System SHALL mengarahkan pengguna ke Dashboard_Admin jika role adalah `admin`, atau ke Dashboard_Buzzer jika role adalah `buzzer`.
4. WHEN pengguna mencoba mengakses halaman dashboard tanpa sesi aktif, THE Auth_System SHALL mengarahkan pengguna ke halaman Login.
5. WHEN pengguna mencoba mengakses Dashboard_Admin dengan role `buzzer`, THE Auth_System SHALL mengarahkan pengguna ke Dashboard_Buzzer.
6. IF proses login gagal karena kredensial tidak valid, THEN THE Auth_System SHALL menampilkan pesan error yang deskriptif kepada pengguna.
7. THE Auth_System SHALL menyimpan data pengguna ke tabel `users` dengan kolom: `id`, `name`, `email`, `role`.

---

### Requirement 2: Manajemen Campaign oleh Admin

**User Story:** Sebagai Admin, saya ingin dapat membuat dan mengelola campaign, sehingga saya dapat mendistribusikan brief promosi kepada buzzer.

#### Acceptance Criteria

1. THE Dashboard_Admin SHALL menampilkan form pembuatan campaign dengan field: judul, deskripsi/brief, dan deadline.
2. WHEN Admin mengisi form dan menekan tombol submit, THE Dashboard_Admin SHALL menyimpan campaign baru ke tabel `campaigns` dengan kolom: `id`, `title`, `description`, `deadline`, `created_by`.
3. THE Dashboard_Admin SHALL menampilkan daftar semua campaign yang telah dibuat beserta status dan progresnya.
4. WHEN Admin membuka detail campaign, THE Dashboard_Admin SHALL menampilkan daftar buzzer yang ditugaskan beserta status submission masing-masing.
5. IF form campaign dikirim dengan field wajib yang kosong, THEN THE Dashboard_Admin SHALL menampilkan pesan validasi dan mencegah penyimpanan data.

---

### Requirement 3: Penugasan Buzzer ke Campaign

**User Story:** Sebagai Admin, saya ingin dapat menugaskan buzzer ke campaign tertentu, sehingga buzzer mengetahui tugas yang harus dikerjakan.

#### Acceptance Criteria

1. THE Dashboard_Admin SHALL menampilkan daftar pengguna dengan role `buzzer` yang dapat dipilih untuk ditugaskan ke campaign.
2. WHEN Admin menugaskan satu atau lebih buzzer ke campaign, THE Dashboard_Admin SHALL menyimpan data ke tabel `assignments` dengan kolom: `id`, `campaign_id`, `buzzer_id`, `status` (default: `pending`).
3. WHEN penugasan berhasil disimpan, THE Email_Service SHALL mengirimkan email notifikasi ke setiap buzzer yang ditugaskan.
4. THE Email_Service SHALL menyertakan informasi berikut dalam email: judul campaign, isi brief/deskripsi, dan deadline.
5. IF pengiriman email gagal, THEN THE Email_Service SHALL mencatat error ke log sistem dan penugasan tetap tersimpan di database.
6. THE Dashboard_Admin SHALL mencegah Admin menugaskan buzzer yang sama ke campaign yang sama lebih dari satu kali.

---

### Requirement 4: Notifikasi Email Otomatis

**User Story:** Sebagai Buzzer, saya ingin menerima email notifikasi saat ditugaskan ke campaign, sehingga saya dapat segera mengetahui dan memulai pekerjaan.

#### Acceptance Criteria

1. WHEN assignment baru dibuat, THE Email_Service SHALL mengirimkan email ke alamat email buzzer yang bersangkutan dalam waktu tidak lebih dari 60 detik.
2. THE Email_Service SHALL menggunakan template email yang memuat: nama buzzer, judul campaign, deskripsi brief, dan deadline.
3. THE Email_Service SHALL diimplementasikan sebagai Supabase Edge Function yang dipanggil setelah insert ke tabel `assignments`.
4. WHERE SendGrid digunakan sebagai provider, THE Email_Service SHALL mengautentikasi request menggunakan API key yang disimpan sebagai environment variable.
5. THE Email_Service SHALL mengirimkan email dengan subject yang mengandung judul campaign agar mudah diidentifikasi oleh buzzer.

---

### Requirement 5: Dashboard Buzzer — Melihat Penugasan

**User Story:** Sebagai Buzzer, saya ingin melihat daftar campaign yang ditugaskan kepada saya, sehingga saya dapat mengetahui brief dan deadline yang harus dipenuhi.

#### Acceptance Criteria

1. THE Dashboard_Buzzer SHALL menampilkan hanya campaign yang memiliki assignment dengan `buzzer_id` sesuai pengguna yang sedang login.
2. THE Dashboard_Buzzer SHALL menampilkan informasi berikut untuk setiap assignment: judul campaign, deskripsi brief, deadline, dan status saat ini.
3. THE Dashboard_Buzzer SHALL menampilkan status assignment dengan label yang jelas: `Pending`, `Submitted`, atau `Approved`/`Rejected`.
4. WHEN Buzzer membuka detail assignment, THE Dashboard_Buzzer SHALL menampilkan brief lengkap dan form untuk mengirimkan submission.

---

### Requirement 6: Submission Link Posting oleh Buzzer

**User Story:** Sebagai Buzzer, saya ingin dapat mengirimkan link posting sebagai bukti kerja, sehingga Admin dapat memverifikasi hasil pekerjaan saya.

#### Acceptance Criteria

1. THE Dashboard_Buzzer SHALL menyediakan form submission dengan field URL link posting.
2. WHEN Buzzer mengirimkan form submission, THE Dashboard_Buzzer SHALL menyimpan data ke tabel `submissions` dengan kolom: `id`, `campaign_id`, `buzzer_id`, `post_link`, `status` (default: `pending`).
3. WHEN submission berhasil disimpan, THE Dashboard_Buzzer SHALL memperbarui status assignment terkait menjadi `submitted`.
4. IF field URL kosong atau format URL tidak valid, THEN THE Dashboard_Buzzer SHALL menampilkan pesan validasi dan mencegah pengiriman data.
5. WHILE status assignment adalah `submitted` atau `approved`, THE Dashboard_Buzzer SHALL menonaktifkan form submission untuk assignment tersebut.

---

### Requirement 7: Approve / Reject Submission oleh Admin

**User Story:** Sebagai Admin, saya ingin dapat menyetujui atau menolak submission dari buzzer, sehingga saya dapat mengontrol kualitas hasil kerja.

#### Acceptance Criteria

1. THE Dashboard_Admin SHALL menampilkan daftar submission dengan status `pending` yang menunggu review.
2. THE Dashboard_Admin SHALL menampilkan link posting yang dikirimkan buzzer agar Admin dapat memverifikasi konten.
3. WHEN Admin menekan tombol Approve, THE Dashboard_Admin SHALL memperbarui kolom `status` pada tabel `submissions` menjadi `approved` dan `status` pada tabel `assignments` menjadi `approved`.
4. WHEN Admin menekan tombol Reject, THE Dashboard_Admin SHALL memperbarui kolom `status` pada tabel `submissions` menjadi `rejected` dan `status` pada tabel `assignments` kembali menjadi `pending`.
5. THE Dashboard_Admin SHALL menampilkan riwayat semua submission (approved, rejected, pending) per campaign.

---

### Requirement 8: Landing Page Publik

**User Story:** Sebagai pengunjung, saya ingin melihat halaman utama platform yang informatif dan menarik, sehingga saya dapat memahami nilai platform dan memutuskan untuk mendaftar.

#### Acceptance Criteria

1. THE Landing_Page SHALL menampilkan hero section dengan background bertema basketball, efek blur/motion, dan headline "Smart Buzzer Campaign Management Platform".
2. THE Landing_Page SHALL menampilkan dua CTA button: "Start Campaign" (mengarah ke Register sebagai Admin) dan "Join as Buzzer" (mengarah ke Register sebagai Buzzer).
3. THE Landing_Page SHALL menampilkan section fitur yang memuat: Campaign Distribution, Email Automation, Real-time Tracking, dan Buzzer Management.
4. THE Landing_Page SHALL menampilkan logo `logobuzzer.png` di navbar kiri atas dan di hero section.
5. THE Landing_Page SHALL dirender dengan desain responsif yang dapat diakses dengan baik pada layar mobile (lebar minimum 375px) maupun desktop.
6. THE Landing_Page SHALL menggunakan Framer Motion untuk animasi masuk (entrance animation) pada elemen hero section.

---

### Requirement 9: Desain dan Pengalaman Pengguna

**User Story:** Sebagai pengguna, saya ingin menggunakan platform dengan tampilan yang modern dan profesional, sehingga pengalaman penggunaan terasa premium dan menyenangkan.

#### Acceptance Criteria

1. THE Landing_Page SHALL menggunakan palet warna: biru primer (`#1a73e8`), putih, dan biru tua/abu gelap (`#040d1a`) sebagai warna utama.
2. THE Dashboard_Admin SHALL menggunakan komponen card dengan efek glassmorphism (background semi-transparan + backdrop-filter blur).
3. THE Dashboard_Buzzer SHALL menggunakan komponen card dengan efek glassmorphism yang konsisten dengan Dashboard_Admin.
4. THE Landing_Page SHALL menggunakan tipografi `Outfit` untuk heading dan `Inter` untuk body text.
5. WHILE pengguna berinteraksi dengan tombol atau card, THE Landing_Page SHALL menampilkan efek hover yang halus (transisi 0.3s).

---

### Requirement 10: Statistik dan Monitoring Campaign

**User Story:** Sebagai Admin, saya ingin melihat statistik ringkas di dashboard, sehingga saya dapat memantau performa campaign secara keseluruhan.

#### Acceptance Criteria

1. THE Dashboard_Admin SHALL menampilkan kartu statistik yang memuat: jumlah campaign aktif, total assignment, jumlah buzzer aktif, dan jumlah submission yang disetujui.
2. THE Dashboard_Admin SHALL menampilkan progress bar per campaign yang menunjukkan persentase submission yang telah disetujui dari total buzzer yang ditugaskan.
3. WHEN data campaign diperbarui, THE Dashboard_Admin SHALL memperbarui tampilan statistik secara real-time tanpa memerlukan refresh halaman penuh.
