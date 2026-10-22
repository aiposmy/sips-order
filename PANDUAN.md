# SIPS Order: Panduan Setup

Sistem ni ada dua page yang berasingan:

| Page | Untuk | Apa yang boleh dilihat |
|---|---|---|
| `index.html` | Customer, takeaway sahaja (link / QR) | Menu, troli, dan status **order sendiri sahaja** |
| `outlet.html` | Staff kaunter / dapur | **Semua** order, kena log masuk |

Kawalan akses dibuat oleh Firebase (`firestore.rules`) di server. Customer yang cuba baca order orang lain akan ditolak oleh server, walaupun dia pandai buka kod page.

---

## Mod demo (tanpa setup)
Selagi `config.js` belum diisi, sistem jalan dalam **mod demo**:
- Order hanya disimpan dalam browser itu sahaja.
- Buka `index.html` dan `outlet.html` dalam dua tab browser yang sama untuk test.
- Kata laluan outlet dalam mod demo: **1234**

---

## Langkah setup live (±20 minit, boleh buat dari telefon)

### 1. Cipta projek Firebase
1. Pergi ke https://console.firebase.google.com, tekan **Add project**, beri nama `sips-order`.
2. Google Analytics boleh dimatikan.

### 2. Hidupkan Authentication
1. **Build → Authentication → Get started**.
2. Tab **Sign-in method**: hidupkan **Anonymous** (untuk customer) dan **Email/Password** (untuk staff).
3. Tab **Users → Add user**: cipta akaun staff, contoh `outlet@sips.my` dengan kata laluan yang kuat.

### 3. Cipta Firestore Database
1. **Build → Firestore Database → Create database**. Lokasi: `asia-southeast1 (Singapore)`. Mula dalam **production mode**.
2. Tab **Rules**: padam semua, tampal isi fail `firestore.rules`, tekan **Publish**.
3. Tab **Data**, tambah senarai staff:
   - **Start collection** → Collection ID: `staff`
   - Document ID: **emel staff tepat** (contoh `outlet@sips.my`)
   - Tambah satu field: `role` = `staff`, kemudian **Save**
   - Ulang untuk setiap staff lain.

### 4. Ambil config
1. **Project settings (ikon gear) → General → Your apps → Web (</>)**. Daftar app, nama `sips-web`.
2. Salin objek `firebaseConfig` dan tampal ke dalam `config.js` (gantikan `ISI_API_KEY_DI_SINI` dan medan lain).

### 5. Upload ke GitHub Pages
1. Cipta repo baru, contoh `sips-order`, dan upload semua fail dalam folder ini.
2. **Settings → Pages → Branch: main / root → Save**.
3. Link customer: `https://<username>.github.io/sips-order/`
4. Link outlet: `https://<username>.github.io/sips-order/outlet.html`
5. Dalam Firebase, pergi **Authentication → Settings → Authorized domains** dan tambah `<username>.github.io`.

### 6. QR order
Jana satu QR dari link customer `https://<username>.github.io/sips-order/`, kemudian tampal di kaunter, banner, bungkusan dan media sosial. Semua order adalah **takeaway**.

---

## Printer dapur (bila dah beli)
Docket dah disusun untuk kertas thermal **80mm**. Butang **Print docket** guna fungsi print browser.

- **Tablet Android + printer Bluetooth/USB 80mm:** install app **RawBT** dan set sebagai print service. Hidupkan **Auto print docket** di dashboard.
- **PC Windows + printer USB/LAN:** set printer thermal sebagai default, kemudian buka Chrome dengan `--kiosk-printing` supaya print terus keluar tanpa popup.
- **Sunmi / iMin (printer built-in):** buka `outlet.html` dalam Chrome. Printer dalaman muncul dalam senarai print.

---

## Tukar menu
Edit senarai `MENU` dalam `config.js`: nama, harga, pilihan, dan `food: true` untuk makanan supaya masuk bahagian MAKANAN dalam docket.

## Kos
Firebase pelan **Spark (percuma)** cukup untuk satu outlet: 50,000 bacaan dan 20,000 tulisan sehari. GitHub Pages percuma.
