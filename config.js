// ================================================================
//  SIPS Order — TETAPAN
//  1. Tampal firebaseConfig dari Firebase Console di bawah.
//  2. Selagi apiKey bermula dengan "ISI", sistem jalan dalam MOD DEMO
//     (order disimpan dalam browser ini sahaja — untuk test).
// ================================================================
export const FIREBASE_CONFIG = {
  apiKey: "ISI_API_KEY_DI_SINI",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const OUTLET = {
  name: "SIPS",
  branch: "Cawangan Utama"
};

// ================================================================
//  MENU (CONTOH) — tukar nama, harga & pilihan ikut menu sebenar
//  food:true  -> masuk bahagian MAKANAN pada docket dapur
// ================================================================
const DRINK_OPTS = [
  { key: "suhu",  label: "Suhu",        choices: [{ n: "Sejuk", p: 0 }, { n: "Panas", p: 0 }] },
  { key: "saiz",  label: "Saiz",        choices: [{ n: "Regular", p: 0 }, { n: "Large", p: 1.5 }] },
  { key: "manis", label: "Tahap manis", choices: [{ n: "Kurang manis", p: 0 }, { n: "Normal", p: 0 }, { n: "Lebih manis", p: 0 }], def: 1 },
];

export const MENU = [
  { cat: "Barli Klasik", items: [
    { id: "b1", name: "Barli Original",    desc: "Air barli rebus perlahan, lembut dan menyegarkan.", price: 4.90, color: "#e9d9b4", opts: DRINK_OPTS },
    { id: "b2", name: "Barli Susu",        desc: "Barli dengan susu segar, creamy dan comfort.",       price: 6.50, color: "#e6d2ae", opts: DRINK_OPTS },
    { id: "b3", name: "Barli Lemon",       desc: "Barli sejuk dengan perahan lemon segar.",            price: 5.90, color: "#efe1a0", opts: DRINK_OPTS },
    { id: "b4", name: "Barli Gula Melaka", desc: "Manis gula melaka asli, aroma karamel.",             price: 6.90, color: "#c79a62", opts: DRINK_OPTS },
  ]},
  { cat: "Barli Signature", items: [
    { id: "s1", name: "Barli Matcha Latte", desc: "Matcha premium berlapis barli susu.",              price: 8.90, color: "#a8bf86", opts: DRINK_OPTS },
    { id: "s2", name: "Barli Coklat",       desc: "Coklat pekat bertemu barli, sedap untuk semua.",   price: 7.90, color: "#8a5f43", opts: DRINK_OPTS },
    { id: "s3", name: "Barli Kurma",        desc: "Kurma dikisar bersama barli dan susu.",            price: 8.50, color: "#a5764f", opts: DRINK_OPTS },
    { id: "s4", name: "Barli Mango Sago",   desc: "Puri mangga, sago dan barli sejuk.",               price: 8.90, color: "#f2c35c", opts: [DRINK_OPTS[1], DRINK_OPTS[2]] },
  ]},
  { cat: "Comfort Bites", items: [
    { id: "c1", name: "Roti Bakar Kaya Butter",         desc: "Roti bakar arang, kaya dan butter sejuk.",     price: 4.50, color: "#d9a85c", food: true, opts: [] },
    { id: "c2", name: "Roti Bakar Telur Separuh Masak", desc: "Set roti bakar + 2 biji telur separuh masak.", price: 6.90, color: "#e8c873", food: true, opts: [] },
    { id: "c3", name: "Kuih Muih (3 pcs)",              desc: "Pilihan kuih harian chef.",                    price: 3.90, color: "#7fb07a", food: true, opts: [] },
    { id: "c4", name: "Cookies Barli Oat",              desc: "Cookies rangup dengan oat dan barli.",         price: 3.50, color: "#c7955d", food: true, opts: [] },
  ]},
];
