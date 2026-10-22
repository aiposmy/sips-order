// Lapisan data: Firebase (live) atau localStorage (mod demo).
// Keselamatan sebenar dikuatkuasakan oleh firestore.rules di server.
import { FIREBASE_CONFIG } from "./config.js";

export const LIVE = !!(FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("ISI"));
export const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

const V = "10.12.2";
let fb = null;
async function F() {
  if (fb) return fb;
  const [app, auth, fs] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const a = app.initializeApp(FIREBASE_CONFIG);
  fb = { auth, fs, A: auth.getAuth(a), D: fs.getFirestore(a) };
  return fb;
}

/* ---------------- MOD DEMO (satu browser, sync antara tab) ---------------- */
const DK = "sips.demo.orders";
const demo = {
  all() { try { return JSON.parse(localStorage.getItem(DK) || "{}"); } catch (e) { return {}; } },
  save(m) { try { localStorage.setItem(DK, JSON.stringify(m)); } catch (e) {} demo.fire(); },
  subs: new Set(),
  fire() { demo.subs.forEach(f => f()); },
};
window.addEventListener("storage", e => { if (e.key === DK) demo.fire(); });
const uidDemo = () => { try { let u = localStorage.getItem("sips.demo.uid"); if (!u) { u = "c" + Math.random().toString(36).slice(2); localStorage.setItem("sips.demo.uid", u); } return u; } catch (e) { return "c-anon"; } };

/* ======================= CUSTOMER ======================= */
export async function customerInit() {
  if (!LIVE) return uidDemo();
  const { auth, A } = await F();
  if (A.currentUser) return A.currentUser.uid;
  const cred = await auth.signInAnonymously(A);
  return cred.user.uid;
}

// Cipta order + nombor giliran harian (transaksi supaya tiada nombor bertindih)
export async function createOrder(order) {
  const day = today();
  if (!LIVE) {
    const m = demo.all();
    const no = Object.values(m).filter(o => o.day === day).length + 1;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    m[id] = { ...order, id, no, day, uid: uidDemo(), status: "new", printed: 0, createdAt: Date.now() };
    demo.save(m);
    return { id, no };
  }
  const { fs, A, D } = await F();
  const uid = A.currentUser.uid;
  const counter = fs.doc(D, "meta", "counter");
  const ref = fs.doc(fs.collection(D, "orders"));
  const no = await fs.runTransaction(D, async tx => {
    const c = await tx.get(counter);
    const cur = c.exists() ? c.data() : null;
    const n = cur && cur.day === day ? cur.n + 1 : 1;
    tx.set(counter, { day, n });
    tx.set(ref, { ...order, no: n, day, uid, status: "new", printed: 0, createdAt: Date.now(), ts: fs.serverTimestamp() });
    return n;
  });
  return { id: ref.id, no };
}

// Customer hanya boleh baca order SENDIRI (rules semak uid)
export async function watchMyOrder(id, cb) {
  if (!LIVE) {
    const run = () => { const o = demo.all()[id]; cb(o && o.uid === uidDemo() ? o : null); };
    demo.subs.add(run); run();
    return () => demo.subs.delete(run);
  }
  const { fs, D } = await F();
  return fs.onSnapshot(fs.doc(D, "orders", id), s => cb(s.exists() ? { id: s.id, ...s.data() } : null), () => cb(null));
}

/* ======================= STAFF / OUTLET ======================= */
const DEMO_PIN = "1234";
export async function staffWatch(cb) {
  if (!LIVE) {
    const run = () => { let ok = false; try { ok = sessionStorage.getItem("sips.demo.staff") === "1"; } catch (e) {} cb(ok ? { email: "demo@sips" } : null); };
    run(); return;
  }
  const { auth, fs, A, D } = await F();
  auth.onAuthStateChanged(A, async u => {
    if (!u || u.isAnonymous) return cb(null);
    try {
      const s = await fs.getDoc(fs.doc(D, "staff", u.email));
      if (s.exists()) cb({ email: u.email });
      else { await auth.signOut(A); cb(null, "Akaun ini bukan staff SIPS."); }
    } catch (e) { await auth.signOut(A); cb(null, "Akaun ini bukan staff SIPS."); }
  });
}
export async function staffLogin(email, pw) {
  if (!LIVE) {
    if (pw !== DEMO_PIN) throw new Error("Kata laluan demo ialah 1234.");
    try { sessionStorage.setItem("sips.demo.staff", "1"); } catch (e) {}
    return;
  }
  const { auth, A } = await F();
  try { await auth.signInWithEmailAndPassword(A, email, pw); }
  catch (e) { throw new Error("Emel atau kata laluan salah."); }
}
export async function staffLogout() {
  if (!LIVE) { try { sessionStorage.removeItem("sips.demo.staff"); } catch (e) {} location.reload(); return; }
  const { auth, A } = await F(); await auth.signOut(A);
}
export async function watchOrders(day, cb) {
  if (!LIVE) {
    const run = () => cb(Object.values(demo.all()).filter(o => o.day === day));
    demo.subs.add(run); run();
    return () => demo.subs.delete(run);
  }
  const { fs, D } = await F();
  const q = fs.query(fs.collection(D, "orders"), fs.where("day", "==", day));
  return fs.onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => cb(null, e));
}
export async function updateOrder(id, patch) {
  if (!LIVE) { const m = demo.all(); if (m[id]) { Object.assign(m[id], patch); demo.save(m); } return; }
  const { fs, D } = await F(); await fs.updateDoc(fs.doc(D, "orders", id), patch);
}
export async function deleteOrder(id) {
  if (!LIVE) { const m = demo.all(); delete m[id]; demo.save(m); return; }
  const { fs, D } = await F(); await fs.deleteDoc(fs.doc(D, "orders", id));
}
