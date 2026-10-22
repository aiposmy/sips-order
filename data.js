// Lapisan data: Firebase (live) atau localStorage (mod demo).
// Keselamatan sebenar dikuatkuasakan oleh firestore.rules di server.
import { FIREBASE_CONFIG, LOYALTY } from "./config.js";

export const LIVE = !!(FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("ISI"));
export const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
export const pointsFor = total => Math.floor(Math.max(0, total) * LOYALTY.pointsPerRM);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

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

/* ================= MOD DEMO (satu browser, sync antara tab) ================= */
const K = { orders: "sips.demo.orders", members: "sips.demo.members", accounts: "sips.demo.accounts", session: "sips.demo.session", guest: "sips.demo.uid" };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} demo.fire(); };
const demo = { subs: new Set(), fire() { demo.subs.forEach(f => f()); } };
window.addEventListener("storage", e => { if (Object.values(K).includes(e.key)) demo.fire(); });
const demoSub = run => { demo.subs.add(run); run(); return () => demo.subs.delete(run); };
const guestUid = () => { let u = load(K.guest, null); if (!u) { u = "g" + newId(); store(K.guest, u); } return u; };
const demoUser = () => { const s = load(K.session, null); return s ? { uid: s.uid, member: true, email: s.email } : { uid: guestUid(), member: false }; };

/* ======================= AKAUN CUSTOMER ======================= */
let authCbs = new Set(), current = null;
function emitAuth(u) { current = u; authCbs.forEach(f => f(u)); }

// cb({uid, member, email, name}) — member=false bermaksud tetamu (tanpa daftar)
export async function onCustomerAuth(cb) {
  authCbs.add(cb);
  if (!LIVE) { emitAuth(demoUser()); return; }
  if (authCbs.size > 1) { if (current) cb(current); return; }
  const { auth, A } = await F();
  auth.onAuthStateChanged(A, async u => {
    if (!u) { try { await auth.signInAnonymously(A); } catch (e) { emitAuth(null); } return; }
    emitAuth({ uid: u.uid, member: !u.isAnonymous, email: u.email || "", name: u.displayName || "" });
  });
}
export async function customerInit() {
  if (!LIVE) return demoUser().uid;
  const { auth, A } = await F();
  if (A.currentUser) return A.currentUser.uid;
  return (await auth.signInAnonymously(A)).user.uid;
}

const authMsg = e => ({
  "auth/email-already-in-use": "Emel ini dah didaftar. Sila log masuk.",
  "auth/invalid-email": "Format emel tak betul.",
  "auth/weak-password": "Kata laluan perlu sekurang-kurangnya 6 aksara.",
  "auth/invalid-credential": "Emel atau kata laluan salah.",
  "auth/wrong-password": "Emel atau kata laluan salah.",
  "auth/user-not-found": "Akaun dengan emel ini tak wujud.",
  "auth/popup-closed-by-user": "Log masuk Google dibatalkan.",
  "auth/popup-blocked": "Browser sekat popup. Cuba guna emel, atau buka link dalam Chrome.",
  "auth/operation-not-allowed": "Cara log masuk ini belum dihidupkan dalam Firebase.",
  "auth/too-many-requests": "Terlalu banyak cubaan. Cuba lagi sekejap.",
}[e?.code] || e?.message || "Ada masalah. Cuba lagi.");

// Cipta profil ahli + voucher selamat datang (sekali sahaja)
async function ensureMember(uid, name, phone, email) {
  if (!LIVE) {
    const m = load(K.members, {});
    if (!m[uid]) {
      const w = LOYALTY.welcome;
      m[uid] = { name, phone, email, points: 0, lifetime: 0, createdAt: Date.now(), lastRedeem: "",
        vouchers: { [w.id]: { title: w.title, value: w.value, min: w.min, status: "active", source: "welcome", createdAt: Date.now() } } };
      store(K.members, m);
    }
    return;
  }
  const { fs, D } = await F();
  const ref = fs.doc(D, "members", uid);
  const snap = await fs.getDoc(ref);
  if (snap.exists()) return;
  const w = LOYALTY.welcome;
  const b = fs.writeBatch(D);
  b.set(ref, { name: name || "Ahli SIPS", phone: phone || "", email: email || "", points: 0, lifetime: 0, createdAt: Date.now(), lastRedeem: "" });
  b.set(fs.doc(D, "members", uid, "vouchers", w.id), { title: w.title, value: w.value, min: w.min, status: "active", source: "welcome", reward: "", createdAt: Date.now() });
  await b.commit();
}

export async function signUpEmail({ name, phone, email, pw }) {
  if (!LIVE) {
    const acc = load(K.accounts, {});
    if (acc[email]) throw new Error("Emel ini dah didaftar. Sila log masuk.");
    if (pw.length < 6) throw new Error("Kata laluan perlu sekurang-kurangnya 6 aksara.");
    const uid = "m" + newId(); acc[email] = { pw, uid }; store(K.accounts, acc);
    await ensureMember(uid, name, phone, email); store(K.session, { uid, email }); emitAuth(demoUser()); return;
  }
  const { auth, A } = await F();
  try {
    const cred = auth.EmailAuthProvider.credential(email, pw);
    let user;
    if (A.currentUser && A.currentUser.isAnonymous) user = (await auth.linkWithCredential(A.currentUser, cred)).user;
    else user = (await auth.createUserWithEmailAndPassword(A, email, pw)).user;
    await auth.updateProfile(user, { displayName: name });
    await user.getIdToken(true);
    await ensureMember(user.uid, name, phone, email);
    emitAuth({ uid: user.uid, member: true, email, name });
  } catch (e) { throw new Error(authMsg(e)); }
}
export async function signInEmail(email, pw) {
  if (!LIVE) {
    const a = load(K.accounts, {})[email];
    if (!a || a.pw !== pw) throw new Error("Emel atau kata laluan salah.");
    store(K.session, { uid: a.uid, email }); emitAuth(demoUser()); return;
  }
  const { auth, A } = await F();
  try { await auth.signInWithEmailAndPassword(A, email, pw); } catch (e) { throw new Error(authMsg(e)); }
}
export async function signInGoogle() {
  if (!LIVE) {
    const email = "ahli.demo@gmail.com", acc = load(K.accounts, {});
    if (!acc[email]) { acc[email] = { pw: "", uid: "m" + newId() }; store(K.accounts, acc); }
    await ensureMember(acc[email].uid, "Ahli Demo", "", email);
    store(K.session, { uid: acc[email].uid, email }); emitAuth(demoUser()); return;
  }
  const { auth, A } = await F();
  const provider = new auth.GoogleAuthProvider();
  let user;
  try {
    if (A.currentUser && A.currentUser.isAnonymous) {
      try { user = (await auth.linkWithPopup(A.currentUser, provider)).user; }
      catch (e) {
        if (e.code !== "auth/credential-already-in-use") throw e;
        user = (await auth.signInWithCredential(A, auth.GoogleAuthProvider.credentialFromError(e))).user;
      }
    } else user = (await auth.signInWithPopup(A, provider)).user;
    await user.getIdToken(true);
    await ensureMember(user.uid, user.displayName, "", user.email);
    emitAuth({ uid: user.uid, member: true, email: user.email, name: user.displayName });
  } catch (e) { throw new Error(authMsg(e)); }
}
export async function resetPassword(email) {
  if (!LIVE) throw new Error("Tetapan semula kata laluan hanya dalam mod live.");
  const { auth, A } = await F();
  try { await auth.sendPasswordResetEmail(A, email); } catch (e) { throw new Error(authMsg(e)); }
}
export async function signOutCustomer() {
  if (!LIVE) { store(K.session, null); emitAuth(demoUser()); return; }
  const { auth, A } = await F(); await auth.signOut(A);
}

// Profil ahli + senarai voucher (live)
export async function watchMember(uid, cb) {
  if (!LIVE) return demoSub(() => {
    const m = load(K.members, {})[uid];
    cb(m ? { ...m, vouchers: Object.entries(m.vouchers || {}).map(([id, v]) => ({ id, ...v })) } : null);
  });
  const { fs, D } = await F();
  let prof = null, vs = [];
  const emit = () => cb(prof ? { ...prof, vouchers: vs } : null);
  const u1 = fs.onSnapshot(fs.doc(D, "members", uid), s => { prof = s.exists() ? s.data() : null; emit(); }, () => cb(null));
  const u2 = fs.onSnapshot(fs.collection(D, "members", uid, "vouchers"), s => { vs = s.docs.map(d => ({ id: d.id, ...d.data() })); emit(); }, () => {});
  return () => { u1(); u2(); };
}
export async function updateProfile(uid, { name, phone }) {
  if (!LIVE) { const m = load(K.members, {}); Object.assign(m[uid], { name, phone }); store(K.members, m); return; }
  const { fs, D } = await F(); await fs.updateDoc(fs.doc(D, "members", uid), { name, phone });
}
// Tukar point dengan voucher
export async function redeemReward(uid, rewardId) {
  const r = LOYALTY.rewards.find(x => x.id === rewardId);
  if (!LIVE) {
    const m = load(K.members, {}); const me = m[uid];
    if (me.points < r.cost) throw new Error("Point tak cukup.");
    const vid = "v" + newId(); me.points -= r.cost; me.lastRedeem = vid;
    me.vouchers[vid] = { title: r.title, value: r.value, min: r.value, status: "active", source: "redeem", reward: r.id, createdAt: Date.now() };
    store(K.members, m); return;
  }
  const { fs, D } = await F();
  const mref = fs.doc(D, "members", uid), vref = fs.doc(fs.collection(D, "members", uid, "vouchers"));
  await fs.runTransaction(D, async tx => {
    const s = await tx.get(mref);
    const pts = s.data().points;
    if (pts < r.cost) throw new Error("Point tak cukup.");
    tx.set(vref, { title: r.title, value: r.value, min: r.value, status: "active", source: "redeem", reward: r.id, createdAt: Date.now() });
    tx.update(mref, { points: pts - r.cost, lastRedeem: vref.id });
  });
}
export async function watchMyOrders(uid, cb) {
  if (!LIVE) return demoSub(() => cb(Object.values(load(K.orders, {})).filter(o => o.uid === uid).sort((a, b) => b.createdAt - a.createdAt)));
  const { fs, D } = await F();
  const q = fs.query(fs.collection(D, "orders"), fs.where("uid", "==", uid), fs.limit(50));
  return fs.onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt)), () => cb([]));
}

/* ======================= ORDER ======================= */
// order: {name, phone, items, subtotal}; voucher: {id, value, title} atau null
export async function createOrder(order, voucher) {
  const day = today();
  const discount = voucher ? voucher.value : 0;
  const base = { ...order, type: "take", table: "", discount, voucherId: voucher ? voucher.id : "", voucherTitle: voucher ? voucher.title : "",
    total: order.subtotal - discount, status: "new", printed: 0, pointsAwarded: false };
  if (!LIVE) {
    const me = demoUser(), m = load(K.orders, {});
    const no = Object.values(m).filter(o => o.day === day).length + 1;
    const id = newId();
    if (voucher) { const mm = load(K.members, {}); const v = mm[me.uid].vouchers[voucher.id]; if (v.status !== "active") throw new Error("Voucher dah digunakan."); Object.assign(v, { status: "used", usedOrder: id, usedAt: Date.now() }); store(K.members, mm); }
    m[id] = { ...base, id, no, day, uid: me.uid, member: me.member, createdAt: Date.now() };
    store(K.orders, m);
    return { id, no };
  }
  const { fs, A, D } = await F();
  const u = A.currentUser, uid = u.uid;
  const counter = fs.doc(D, "meta", "counter");
  const ref = fs.doc(fs.collection(D, "orders"));
  const vref = voucher ? fs.doc(D, "members", uid, "vouchers", voucher.id) : null;
  const no = await fs.runTransaction(D, async tx => {
    const c = await tx.get(counter);
    if (vref) { const v = await tx.get(vref); if (!v.exists() || v.data().status !== "active") throw new Error("Voucher dah digunakan."); }
    const cur = c.exists() ? c.data() : null;
    const n = cur && cur.day === day ? cur.n + 1 : 1;
    tx.set(counter, { day, n });
    if (vref) tx.update(vref, { status: "used", usedOrder: ref.id, usedAt: Date.now() });
    tx.set(ref, { ...base, no: n, day, uid, member: !u.isAnonymous, createdAt: Date.now(), ts: fs.serverTimestamp() });
    return n;
  });
  return { id: ref.id, no };
}

export async function watchMyOrder(id, cb) {
  if (!LIVE) return demoSub(() => { const o = load(K.orders, {})[id]; cb(o && o.uid === demoUser().uid ? o : (o && load(K.guest) === o.uid ? o : null)); });
  const { fs, D } = await F();
  return fs.onSnapshot(fs.doc(D, "orders", id), s => cb(s.exists() ? { id: s.id, ...s.data() } : null), () => cb(null));
}

/* ======================= STAFF / OUTLET ======================= */
const DEMO_PIN = "1234";
export async function staffWatch(cb) {
  if (!LIVE) {
    let ok = false; try { ok = sessionStorage.getItem("sips.demo.staff") === "1"; } catch (e) {}
    cb(ok ? { email: "demo@sips" } : null); return;
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
  if (!LIVE) return demoSub(() => cb(Object.values(load(K.orders, {})).filter(o => o.day === day)));
  const { fs, D } = await F();
  const q = fs.query(fs.collection(D, "orders"), fs.where("day", "==", day));
  return fs.onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => cb(null, e));
}
export async function updateOrder(id, patch) {
  if (!LIVE) { const m = load(K.orders, {}); if (m[id]) { Object.assign(m[id], patch); store(K.orders, m); } return; }
  const { fs, D } = await F(); await fs.updateDoc(fs.doc(D, "orders", id), patch);
}
export async function deleteOrder(id) {
  if (!LIVE) { const m = load(K.orders, {}); delete m[id]; store(K.orders, m); return; }
  const { fs, D } = await F(); await fs.deleteDoc(fs.doc(D, "orders", id));
}
// "Dah diambil": tandakan selesai & beri point kepada ahli (sekali sahaja)
export async function completeOrder(o) {
  const pts = pointsFor(o.total);
  if (!LIVE) {
    const m = load(K.orders, {}), x = m[o.id]; if (!x) return 0;
    let given = 0;
    if (x.member && !x.pointsAwarded) { const mm = load(K.members, {}); if (mm[x.uid]) { mm[x.uid].points += pts; mm[x.uid].lifetime += pts; store(K.members, mm); given = pts; } }
    Object.assign(x, { status: "done", doneAt: Date.now(), pointsAwarded: x.pointsAwarded || !!given, points: x.points || given });
    store(K.orders, m); return given;
  }
  const { fs, D } = await F();
  const oref = fs.doc(D, "orders", o.id);
  return fs.runTransaction(D, async tx => {
    const s = await tx.get(oref); const x = s.data();
    let given = 0, mref = null, ms = null;
    if (x.member && !x.pointsAwarded) { mref = fs.doc(D, "members", x.uid); ms = await tx.get(mref); }
    if (ms && ms.exists()) { const d = ms.data(); tx.update(mref, { points: (d.points || 0) + pts, lifetime: (d.lifetime || 0) + pts }); given = pts; }
    tx.update(oref, { status: "done", doneAt: Date.now(), pointsAwarded: x.pointsAwarded || !!given, points: x.points || given });
    return given;
  });
}
// Batal order: pulangkan voucher kepada ahli
export async function cancelOrder(o) {
  if (!LIVE) {
    if (o.voucherId) { const mm = load(K.members, {}); const v = mm[o.uid]?.vouchers?.[o.voucherId]; if (v) { v.status = "active"; delete v.usedOrder; store(K.members, mm); } }
    return updateOrder(o.id, { status: "cancel", cancelAt: Date.now() });
  }
  const { fs, D } = await F();
  const b = fs.writeBatch(D);
  b.update(fs.doc(D, "orders", o.id), { status: "cancel", cancelAt: Date.now() });
  if (o.voucherId) b.update(fs.doc(D, "members", o.uid, "vouchers", o.voucherId), { status: "active", usedOrder: "", usedAt: 0 });
  await b.commit();
}
