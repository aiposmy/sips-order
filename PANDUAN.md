# SIPS Order: Panduan Setup

Sistem ni ada dua page yang berasingan:

| Page | Untuk | Apa yang boleh dilihat |
|---|---|---|
| `index.html` | Customer, takeaway sahaja (link / QR) | Menu, troli, dan status **order sendiri sahaja** |
| `outlet.html` | Staff kaunter / dapur | **Semua** order, kena log masuk |
| `admin.html` | Pemilik / pengurus (peranan **admin**) | Laporan jualan, margin & untung, urus produk, kos, shift dan semua order |

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

### 2b. Hidupkan log masuk Google (untuk ahli)
**Authentication → Sign-in method → Add new provider → Google → Enable**, pilih emel sokongan (emel awak), kemudian **Save**.

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

## Shift, order manual & bayaran (dashboard outlet)
- **Buka shift** setiap kali mula operasi: isi nama staff bertugas dan duit permulaan dalam laci.
- Selagi shift **belum dibuka**: staff tak boleh terima, buat atau serah order, dan **pelanggan tak boleh hantar order** dari app (page pelanggan tunjuk "Outlet sedang tutup"). Ini dikuatkuasakan oleh rules server.
- **＋ Order manual**: untuk pelanggan walk-in yang tak order melalui app. Pilih menu, kemudian **Terima bayaran**.
- **Cara bayaran**: Tunai (CASH), QRPay / DuitNow, Kad Debit / Kredit. Untuk tunai, masukkan duit diterima dan sistem kira baki.
- Order dari app dibayar di kaunter: bila order siap, tekan **Terima bayaran**, pilih cara bayaran, dan order terus selesai (point ahli masuk).
- **Tutup shift**: sistem tunjuk jualan ikut cara bayaran dan **tunai sepatutnya dalam laci** (duit permulaan + jualan tunai). Staff kira duit dalam laci dan masukkan jumlahnya. Sistem tunjuk beza (lebih/kurang).
- Semua laporan shift disimpan dalam **Sejarah shift** (dan dalam Firebase: Firestore → shifts).

## Sticker cawan (printer label)
- Setiap cawan dapat **satu sticker**: no. order, nama pelanggan, nama minuman, pilihan, nota, dan bilangan (1/3, 2/3…).
- Kalau pelanggan tulis **ucapan**, satu **sticker ucapan** tambahan dicetak selepas sticker cawan tu.
- Saiz sticker ditetapkan dalam `config.js` → `LABEL` (default 50×30mm). Tukar ikut saiz gulungan sticker printer awak (contoh 40×30 atau 58×40).
- Dalam tetapan print, pilih printer label dan saiz kertas yang sama. Untuk print terus tanpa popup, guna RawBT (Android) atau Chrome `--kiosk-printing` (PC).

## Ucapan pada cawan
- Pelanggan tekan **"Jadikan cawan ini hadiah"** semasa pilih minuman, pilih ucapan sedia ada (Happy Birthday, Happy Anniversary dll) atau tulis sendiri, berserta **Untuk** dan **Dari**.
- Senarai ucapan sedia ada boleh diubah dalam `config.js` → `GIFT.presets`.
- Staff juga boleh tambah ucapan dalam order manual.

## Program ahli (point & voucher)
- Customer boleh order **tanpa daftar** (tiada point), atau **daftar ahli** guna Google atau emel.
- Ahli baru terus dapat **voucher selamat datang** (RM2, min. belanja RM8).
- **1 point untuk setiap RM1.** Point masuk bila staff tekan **Dah diambil** di dashboard outlet. Order yang dibatalkan tak dapat point, dan voucher yang dipakai dipulangkan kepada ahli.
- Ahli tukar point dengan voucher dalam **Akaun saya** (50 point = RM5, 90 point = RM10).
- Untuk tukar nilai: edit `LOYALTY` dalam `config.js` **dan** nombor yang sama dalam bahagian "PROGRAM AHLI" dalam `firestore.rules`, kemudian Publish semula rules.
- Senarai ahli boleh dilihat dalam Firebase: **Firestore → Data → members**.

## Page admin (laporan & produk)
**Sediakan akaun admin (sekali sahaja):** Firebase → Firestore → koleksi `staff` → buka dokumen emel anda → **Add field**: `role` (string) = `admin` → Save. Staff biasa boleh kekal tanpa field ini (atau `role` = `staff`).

**Mula guna menu dari Firebase (sekali sahaja):** buka `admin.html` → tab **Produk** → tekan **Salin menu ke Firebase**. Selepas ini menu diurus di page admin, bukan lagi dalam `config.js`.

**Laporan** (pilih tempoh: hari ini, semalam, 7 hari, 30 hari, bulan ini, bulan lepas atau tarikh sendiri; setiap angka dibanding dengan tempoh sebelumnya):
- Ringkasan: jualan bersih, order dibayar, purata setiap order, item terjual, untung kasar, margin, diskaun, order batal
- Jualan harian, trend ikut jam (waktu paling sibuk) dan ikut hari dalam minggu
- Jualan ikut produk (kuantiti, jualan, kos, untung, margin), ikut kategori, ikut cara bayaran
- Diskaun & voucher, sumber order (App / Kaunter), ahli vs tetamu, point diberi
- Pilihan paling popular (contoh Large, Kurang manis) dan ucapan pada cawan
- Muat turun CSV (produk & order) untuk Excel

**Untung & margin** dikira daripada **kos seunit** yang diisi di setiap produk (dan kos tambahan pilihan, contohnya Large +RM0.50). Kos hanya boleh dilihat oleh admin. Laporan guna kos semasa.

**Produk:** tambah, edit, padam; gambar (dikecilkan automatik), harga, kos, label, kategori, pilihan; sembunyikan dari menu; tanda stok habis.
**Kategori & pilihan:** urus kategori dan kumpulan pilihan (Suhu, Saiz, Tahap manis) berserta harga tambahan.
**Shift:** semua shift dalam tempoh, jualan ikut cara bayaran dan beza tunai.
**Order:** senarai semua order dengan tapisan (status, sumber, bayaran), carian dan butiran setiap order.

## Stok habis
- **Dashboard staff** → buka bahagian **Stok menu** → tekan item untuk tukar **Ada / Habis**.
- Item habis dipaparkan kelabu dengan label "Habis" di page pelanggan dan tak boleh dipesan. Kalau item dalam troli pelanggan habis, pelanggan diminta buang dulu sebelum hantar.
- Dalam order manual, item habis juga dikunci.
- Admin juga boleh tanda habis dalam editor produk.


## Kawalan keselamatan & operasi (v7)

### Rekod jualan tak boleh dipadam
- Tiada butang padam order di mana-mana page. Rules server: `allow delete: if false` untuk order, shift dan audit log.
- **Batal** hanya untuk order **belum dibayar**, dan **wajib alasan**. Nama staff dan masa direkod.
- Order yang **dah dibayar** tak boleh dibatalkan oleh staff. Hanya **admin** boleh buat **Refund / void** di page admin (tab Order → Lihat → Refund / void), dengan alasan wajib. Order kekal dalam rekod dengan status "Refund"; point ahli ditolak semula dan voucher dipulangkan. Refund tunai ditolak daripada tunai dijangka shift semasa.
- Staff tak boleh ubah item, harga asal atau bayaran yang dah direkod (dikuatkuasakan oleh rules).

### Audit log (tab Aktiviti di page admin)
Direkod automatik dan tak boleh diubah atau dipadam oleh sesiapa: batal order, refund, tak datang ambil, harga dibetulkan, cetak sticker semula, buka/tutup shift, stok habis/ada, jeda order app, tukar harga produk, tambah/padam produk.

### Semakan harga
- Pelanggan menghantar harga dari telefon, jadi dashboard staff **kira semula harga** setiap order berdasarkan menu dalam Firebase (yang hanya admin boleh ubah).
- Kalau tak sepadan, tiket tunjuk amaran oren dan **bayaran dikutip ikut harga menu**. Pembetulan direkod dalam Aktiviti.
- Nota: pengesahan penuh di server memerlukan Cloud Functions (pelan Blaze). Selagi bayaran di kaunter, semakan oleh dashboard staff ini sudah melindungi kutipan.

### Pengesahan QRPay & Kad
- QR/Kad **wajib** no. rujukan / approval (min. 4 aksara) dan tick pengesahan: "bayaran masuk dalam app bank / merchant" atau "terminal tunjuk APPROVED".
- Nama staff (dari shift) + emel log masuk + masa disimpan pada order. **Jangan terima screenshot pelanggan sebagai bukti tunggal.**

### Status berasingan
Pelanggan nampak 5 langkah: **Diterima → Disediakan → Siap diambil → Bayaran disahkan → Diambil**. Di dashboard: "Terima bayaran" (boleh semasa disediakan atau siap) dan "Serah kepada pelanggan" (hanya selepas dibayar). Point ahli masuk semasa diserah.

### Anggaran siap, kapasiti & jeda order
- Tetapan dalam `config.js` → `QUEUE`: masa asas, minit setiap cawan, bilangan barista, had order aktif, tempoh ambil.
- Pelanggan nampak anggaran siap sebelum dan selepas order. Kalau lewat, page pelanggan tunjuk mesej mohon maaf. Staff boleh tekan **+5 min** untuk kemas kini masa.
- Bila order siap, telefon pelanggan berbunyi/bergetar dan tunjuk notifikasi (jika dibenarkan).
- **Had order aktif**: bila penuh, pelanggan diminta cuba sebentar lagi. **Jeda order app**: butang di dashboard untuk hentikan order online sementara (rules server juga menyekat).

### Tak datang ambil (No-show)
- Selepas order siap dan belum dibayar melebihi `QUEUE.pickupMin` minit, butang **Tak datang** muncul.
- Direkod sahaja (tiada denda). Ahli yang kerap tak ambil akan ditanda "⚠ N× tak ambil sebelum ini" pada tiket.

### Tutup shift dengan laporan pengecualian
Sebelum tutup shift, sistem senaraikan: order tergantung (termasuk yang **dah bayar tapi belum diserah**), batal + alasan, tak datang ambil, harga dibetulkan, refund, sticker dicetak lebih sekali. **Catatan wajib** jika ada beza tunai atau order tergantung. Laporan disimpan bersama rekod shift.

### Elak sticker dicetak dua kali
- Hidupkan **Peranti pencetak** pada **satu peranti sahaja** (yang disambung ke printer). Peranti lain biarkan OFF.
- Order yang dah dicetak tak dicetak automatik lagi. Cetak semula perlu ditekan sendiri dan direkod dalam Aktiviti.

### Internet terputus
Dashboard tunjuk banner merah "Tiada sambungan internet" dan butang tindakan dikunci sehingga sambungan pulih. Jangan muat semula page semasa offline.

## Senarai semak sebelum pelancaran (UAT)
1. [ ] Publish `firestore.rules` terkini, kemudian semak tab Rules dalam Firebase sama dengan fail ini.
2. [ ] Akaun: pemilik = `role: admin`; akaun kaunter = `role: staff`. Uji akaun staff **tak boleh** buka page admin.
3. [ ] Salin menu ke Firebase; isi harga & kos sebenar.
4. [ ] Uji 20 order serentak dari beberapa telefon berbeza; pastikan nombor order tak berganda.
5. [ ] Uji bayaran QR: rujukan wajib, semak app bank sebelum sahkan.
6. [ ] Uji batal (alasan wajib) dan refund oleh admin; semak Aktiviti.
7. [ ] Uji tutup shift dengan order tergantung dan kira tunai sebenar dalam laci.
8. [ ] Uji internet putus (matikan Wi-Fi) dan sambung semula di dashboard & telefon pelanggan.
9. [ ] Uji printer label: sticker tak keluar dua kali; hanya satu peranti pencetak ON.
10. [ ] Uji anggaran siap, jeda order app, had order penuh dan "Tak datang ambil".

## Kos
Firebase pelan **Spark (percuma)** cukup untuk satu outlet: 50,000 bacaan dan 20,000 tulisan sehari. GitHub Pages percuma.
