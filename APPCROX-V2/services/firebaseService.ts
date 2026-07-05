import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { Category, Family, FamilyMember, WeeklyArchiveEntry } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---------------------------------------------------------------------------
// PIN parent : simple hash SHA-256 côté client (pas de mot de passe séparé,
// juste un frein pour que les enfants ne tombent pas par hasard dans
// l'espace parent — voir DEPLOYMENT.md pour le modèle de sécurité complet).
// ---------------------------------------------------------------------------
export const hashPin = async (pin: string): Promise<string> => {
  const data = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe =>
  onAuthStateChanged(auth, callback);

export const signUpFamily = async (email: string, password: string): Promise<string> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const familyRef = doc(db, 'families', credential.user.uid);
  const newFamily: Family = { email, pinHash: '', setupComplete: false };
  await setDoc(familyRef, { ...newFamily, createdAt: serverTimestamp() });
  return credential.user.uid;
};

export const signInFamily = async (email: string, password: string): Promise<string> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user.uid;
};

export const signOutFamily = (): Promise<void> => signOut(auth);

// ---------------------------------------------------------------------------
// Famille (families/{uid})
// ---------------------------------------------------------------------------

export const getFamily = async (uid: string): Promise<Family | null> => {
  const snap = await getDoc(doc(db, 'families', uid));
  return snap.exists() ? (snap.data() as Family) : null;
};

export const completeSetup = async (uid: string, pin: string): Promise<void> => {
  const pinHash = await hashPin(pin);
  await updateDoc(doc(db, 'families', uid), { pinHash, setupComplete: true });
};

export const verifyParentPin = async (uid: string, pin: string): Promise<boolean> => {
  const family = await getFamily(uid);
  if (!family?.pinHash) return false;
  const attemptHash = await hashPin(pin);
  return attemptHash === family.pinHash;
};

export const updateParentPin = async (uid: string, pin: string): Promise<void> => {
  const pinHash = await hashPin(pin);
  await updateDoc(doc(db, 'families', uid), { pinHash });
};

// ---------------------------------------------------------------------------
// Membres (families/{uid}/members/{memberId})
// ---------------------------------------------------------------------------

export type NewMember = Omit<FamilyMember, 'id'>;

export const listenMembers = (uid: string, callback: (members: FamilyMember[]) => void): Unsubscribe =>
  onSnapshot(collection(db, 'families', uid, 'members'), (snap) => {
    const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FamilyMember);
    callback(members);
  });

export const createMember = async (
  uid: string,
  name: string,
  avatarId: string,
  color: string,
  role: 'parent' | 'child'
): Promise<string> => {
  const newMember: NewMember = { name, avatarId, color, role, chores: {}, bonusCroix: 0, totalEarnings: 0, archive: [] };
  const ref = await addDoc(collection(db, 'families', uid, 'members'), newMember);
  return ref.id;
};

export const updateMember = (uid: string, memberId: string, data: Partial<FamilyMember>): Promise<void> =>
  updateDoc(doc(db, 'families', uid, 'members', memberId), data);

export const deleteMember = (uid: string, memberId: string): Promise<void> =>
  deleteDoc(doc(db, 'families', uid, 'members', memberId));

/** Persiste le résultat d'un mark/unmark croix (voir utils/rewards.ts pour le calcul). */
export const saveMemberChores = (uid: string, memberId: string, chores: Record<string, number>, bonusCroix: number): Promise<void> =>
  updateDoc(doc(db, 'families', uid, 'members', memberId), { chores, bonusCroix });

/** Clôture la semaine pour un membre : archive, remet les compteurs à zéro, crédite le total. */
export const archiveMemberWeek = (
  uid: string,
  memberId: string,
  archiveEntry: WeeklyArchiveEntry,
  newTotalEarnings: number,
  currentArchive: WeeklyArchiveEntry[]
): Promise<void> =>
  updateDoc(doc(db, 'families', uid, 'members', memberId), {
    chores: {},
    bonusCroix: 0,
    totalEarnings: newTotalEarnings,
    archive: [archiveEntry, ...currentArchive],
  });

// ---------------------------------------------------------------------------
// Catégories (families/{uid}/categories/{categoryId})
// ---------------------------------------------------------------------------

export type NewCategory = Omit<Category, 'id'>;

export const listenCategories = (uid: string, callback: (categories: Category[]) => void): Unsubscribe =>
  onSnapshot(collection(db, 'families', uid, 'categories'), (snap) => {
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
    callback(categories);
  });

export const createCategory = async (uid: string, data: NewCategory): Promise<string> => {
  const ref = await addDoc(collection(db, 'families', uid, 'categories'), data);
  return ref.id;
};

export const updateCategory = (uid: string, categoryId: string, data: Partial<Category>): Promise<void> =>
  updateDoc(doc(db, 'families', uid, 'categories', categoryId), data);

export const deleteCategory = (uid: string, categoryId: string): Promise<void> =>
  deleteDoc(doc(db, 'families', uid, 'categories', categoryId));
