# 📍 Local Event Finder

Aplikasi mobile **cross-platform** untuk menemukan dan membuat event lokal di sekitarmu lewat **peta interaktif**. Cari event berdasarkan radius lokasi & kategori, lalu buat event-mu sendiri — dibangun dengan **Expo, React Native & Firebase**.

---

## ✨ Fitur

- **Peta Interaktif** — lihat event di sekitarmu sebagai marker di peta (`react-native-maps`)
- **Pencarian Berbasis Radius** — filter event dalam jangkauan tertentu dengan perhitungan jarak Haversine yang presisi
- **Lokasi Real-time** — deteksi posisi otomatis via GPS, atau input koordinat manual
- **Buat Event** — tambahkan event baru lengkap dengan judul, deskripsi, kategori, dan lokasi
- **Data Real-time** — sinkronisasi event langsung dari Firestore (`onSnapshot`)
- **Login Google** — autentikasi via Firebase Auth + Expo AuthSession
- **Cross-platform** — berjalan di **iOS, Android, dan Web** dari satu basis kode
- **Dark Mode** — mengikuti tema sistem secara otomatis

---

## 🛠️ Tech Stack

| Teknologi                    | Kegunaan                         |
| ---------------------------- | -------------------------------- |
| Expo (SDK 55) + React Native | Framework mobile cross-platform  |
| Expo Router                  | File-based navigation            |
| Firebase (Auth + Firestore)  | Autentikasi & database real-time |
| react-native-maps            | Peta & marker event              |
| expo-location                | Deteksi lokasi pengguna          |
| expo-auth-session            | Login Google                     |
| react-native-reanimated      | Animasi                          |
| TypeScript                   | Type safety                      |

---

## 📱 Screenshot

> Coming soon

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js 18 atau 20 LTS
- Akun & project [Firebase](https://console.firebase.google.com/)
- Expo Go (install di [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) atau [App Store](https://apps.apple.com/app/expo-go/id982107779))

### Instalasi

```bash
# Clone repository
git clone https://github.com/riskyakbar15/local-event-finder.git
cd local-event-finder

# Install dependencies
npm install --legacy-peer-deps
```

### Konfigurasi Firebase

Aplikasi membutuhkan kredensial Firebase untuk Auth & Firestore. Lihat panduan lengkap di [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

Singkatnya, buat file `.env` di root project (jangan di-commit):

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

### Jalankan

```bash
npx expo start          # buka di Expo Go (scan QR)
npm run android         # buka di emulator/perangkat Android
npm run ios             # buka di simulator iOS
npm run web             # buka di browser
```

---

## 📁 Struktur Project

```struktur
local-event-finder/
├── src/
│   ├── app/                      # Screens (Expo Router)
│   │   ├── _layout.tsx           # Root layout & navigation
│   │   ├── index.tsx             # Home screen
│   │   ├── explore.tsx           # Jelajahi event
│   │   ├── map.tsx               # Peta event interaktif
│   │   └── create-event.tsx      # Form buat event
│   ├── components/               # Komponen UI reusable
│   ├── config/
│   │   └── firebase.ts           # Inisialisasi Firebase
│   ├── constants/
│   │   └── theme.ts              # Tema & spacing
│   ├── features/
│   │   ├── auth/                 # Autentikasi (Google Sign-In)
│   │   ├── events/               # Logic event (CRUD + radius)
│   │   └── location/             # Logic lokasi pengguna
│   └── hooks/                    # Custom hooks (theme, color scheme)
├── docs/
│   └── FIREBASE_SETUP.md         # Panduan setup Firebase
└── app.json                      # Konfigurasi Expo
```

---

## 🗺️ Roadmap

- [x] Peta interaktif dengan marker event
- [x] Pencarian event berbasis radius (Haversine)
- [x] Deteksi lokasi otomatis & input manual
- [x] Buat event baru
- [x] Login Google via Firebase Auth
- [x] Sinkronisasi data real-time (Firestore)
- [ ] Filter berdasarkan kategori
- [ ] Detail event & RSVP
- [ ] Upload gambar event
- [ ] Notifikasi event terdekat

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

<!-- markdownlint-disable MD033 -->
<div align="center">

Dibuat dengan ❤️ menggunakan Expo & React Native

</div>
<!-- markdownlint-enable MD033 -->
