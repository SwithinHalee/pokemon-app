# Frontend Intern Assignment - Pokédex Application

Aplikasi Pokédex ini dikembangkan sebagai bagian dari penilaian teknis untuk posisi Frontend Intern. Proyek ini dibangun menggunakan **Next.js 16 (App Router)** dan **Tailwind CSS**, dengan fokus ganda pada pemenuhan persyaratan tugas (*UI Slicing* presisi, Integrasi API) serta optimasi performa tinggi (*High Performance Engineering*).

## Fitur Utama & Arsitektur Teknis

Aplikasi ini dirancang bukan hanya untuk menampilkan data, tetapi juga untuk memberikan pengalaman pengguna yang mulus melalui optimasi berikut:

* **Pencarian Terintegrasi (Asynchronous)**: Sistem pencarian berbasis teks dan ID dengan fitur saran (*suggestion*) yang diproses secara asinkron untuk responsivitas maksimal.
* **Sistem Filter Lanjut**: Implementasi logika filter ganda yang memungkinkan penyaringan berdasarkan Generasi (Region) dan Tipe secara simultan tanpa membebani server secara berlebihan.
* **Hybrid Pagination Strategy**: Penggunaan *Server-side pagination* untuk memuat data awal, dikombinasikan dengan *Local memory pagination* untuk memastikan transisi halaman yang instan saat filter aktif.
* **Lazy Data Enrichment**: Mekanisme pelengkapan data tipe (Dual Type) secara dinamis yang hanya berjalan pada item yang terlihat di layar (*viewport*) untuk menghemat penggunaan bandwidth dan sumber daya klien.
* **Race Condition Protection**: Implementasi mekanisme *ID request unik* untuk menjamin konsistensi data saat terjadi perubahan status filter atau pencarian yang cepat.
* **UX State Persistence**: Sinkronisasi status filter dan posisi scroll menggunakan `sessionStorage` untuk memastikan kontinuitas pengalaman pengguna saat melakukan navigasi kembali (*back navigation*).

## Implementasi SSR dan CSR

Sesuai dengan persyaratan teknis tugas, proyek ini menerapkan strategi rendering hibrida untuk menyeimbangkan performa SEO dan interaktivitas pengguna:

### Server Side Rendering (SSR)
SSR digunakan sebagai strategi utama untuk *data fetching* guna memastikan performa *First Contentful Paint* (FCP) yang optimal dan SEO yang baik.
* **Daftar Pokémon**: Data awal pada halaman utama diambil di sisi server agar konten siap dirender saat diakses oleh *crawler* mesin pencari atau pengguna.
* **Detail Pokémon**: Data spesifik (Stats, Abilities, Type, Metadata) pada halaman `[name]` diambil menggunakan `fetch` di *Server Component*. Title dan Meta Description dihasilkan secara dinamis di server.

### Client Side Rendering (CSR)
CSR digunakan secara selektif untuk komponen yang membutuhkan interaktivitas tinggi.
* **Interaksi UI**: Komponen seperti *Search Bar*, *Filter Logic*, dan *Tabs* pada halaman detail menggunakan `"use client"` untuk menangani *event listener* dan manajemen *state* tanpa membebani server.
* **Navigasi SPA**: Transisi antar halaman menggunakan komponen `Link` dari Next.js untuk pengalaman navigasi instan tanpa *full page reload*.

## Stack Teknologi

* **Framework Utama**: Next.js 16 (App Router Architecture).
* **Bahasa Pemrograman**: TypeScript (Strongly Typed).
* **Styling**: Tailwind CSS dengan konfigurasi desain minimalis.
* **Data Fetching**: Native Fetch API dengan implementasi kustom *Retry Logic* dan *Caching Strategy*.
* **Deployment**: Vercel (Opsional).

## Endpoint API

Aplikasi ini menggunakan endpoint publik dari [PokeAPI](https://pokeapi.co/):

1.  **Get Pokemon List** (Halaman Utama)
    * URL: `https://pokeapi.co/api/v2/pokemon`
    * Method: `GET`
    * Fungsi: Mengambil daftar dasar Pokémon untuk ditampilkan dalam bentuk Grid/List.

2.  **Get Pokemon Detail** (Halaman Detail)
    * URL: `https://pokeapi.co/api/v2/pokemon/{name}`
    * Method: `GET`
    * Fungsi: Mengambil data mendetail seperti gambar (official artwork), tipe, statistik (HP, Attack, dll), tinggi, dan berat.

## Prosedur Instalasi

Pastikan lingkungan pengembangan Anda telah memenuhi persyaratan Node.js versi 18.x atau yang lebih baru.

1.  **Persiapan Lingkungan (Node.js)**
    Pastikan Node.js dan NPM sudah terinstal.
    * Cek versi:
        ```bash
        node -v
        npm -v
        ```

2.  **Kloning Repositori**
    ```bash
    git clone [https://github.com/username/pokemon-app.git](https://github.com/username/pokemon-app.git)
    cd pokemon-app
    ```

3.  **Instalasi Dependensi**
    Jalankan perintah ini untuk menginstal semua paket, termasuk **Tailwind CSS**:
    ```bash
    npm install
    ```

4.  **Verifikasi Konfigurasi Tailwind (Opsional)**
    Pastikan file `tailwind.config.ts` mencakup direktori yang benar agar styling berfungsi:
    ```typescript
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    ```

5.  **Eksekusi Server Pengembangan**
    ```bash
    npm run dev
    ```
    Aplikasi dapat diakses melalui alamat default [http://localhost:3000](http://localhost:3000).

## 📂 Struktur Proyek

Berikut adalah struktur direktori utama aplikasi beserta penjelasannya:

```text
├── app/                  # App Router & Server Components
│   ├── pokemon/[name]/   # Dynamic Route untuk Halaman Detail (SSR)
│   │   ├── loading.tsx   # UI Skeleton khusus halaman detail (Instant Loading)
│   │   └── page.tsx      # Logic utama fetching data detail & rendering
│   ├── globals.css       # Konfigurasi Global CSS & Tailwind Directives
│   ├── layout.tsx        # Root Layout & Font Configuration
│   └── page.tsx          # Halaman Utama / Homepage (SSR)
├── components/           # Reusable UI Components (CSR/SSR)
│   ├── PokemonListClient # Kontroler utama daftar Pokémon, filter logika, & pagination
│   ├── PokemonCard       # Komponen presentasional kartu untuk item Pokémon
│   ├── PokemonSearch     # Input pencarian & suggestion engine
│   ├── PokemonDetail     # Komponen visualisasi detail (Tabs informasi & interaksi)
│   ├── StatBar           # Komponen visualisasi progress bar statistik
│   └── TypeBadge         # Komponen label/badge tipe Pokémon
├── lib/                  # Utilitas & Logika Bisnis
│   ├── api.ts            # Wrapper fungsi fetch API & data enrichment
│   ├── utils.ts          # Fungsi pembantu (helper functions)
│   └── constants.ts      # Data statis (Warna tipe, Generasi, Type Chart)
├── types/                # Definisi Interface TypeScript
│   └── index.ts          # Kontrak data global untuk objek Pokémon & Evolusi
├── public/               # Aset statis (Gambar default/Icons)
└── README.md             # Dokumentasi Proyek