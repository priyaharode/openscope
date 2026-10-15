import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';

// Configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('MY_')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    console.log('🔥 [OpenScope] Firebase client initialized with project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('⚠️ [OpenScope] Firebase init exception, running in resilient local auth mode:', err);
    auth = null;
  }
} else {
  console.log('ℹ️ [OpenScope] Firebase config environment variables not detected. Running resilient local authentication engine.');
}

export { auth, isConfigured };

// Fallback & universal Auth User definition
export interface AppAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  getIdToken: () => Promise<string>;
}

// Local mock storage key for simulation when Firebase credentials aren't set in env
const LOCAL_USERS_KEY = 'openscope_local_users_v1';
const LOCAL_CURRENT_USER_KEY = 'openscope_local_auth_v1';

// Seed demo users
function getLocalUsers(): Record<string, { uid: string; email: string; displayName: string; passHash: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  const defaultUsers = {
    'researcher@openscope.org': {
      uid: 'usr-elena-rostova-demo',
      email: 'researcher@openscope.org',
      displayName: 'Dr. Elena Rostova',
      passHash: 'openscope123'
    }
  };
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
  } catch (e) {
    // ignore
  }
  return defaultUsers;
}

function saveLocalUsers(users: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    // ignore
  }
}

// Universal Auth Operations wrapping real Firebase when enabled, with zero-latency local fallback
export async function authenticateWithEmail(email: string, pass: string): Promise<AppAuthUser> {
  if (auth) {
    const cred = await fbSignIn(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || email.split('@')[0],
      photoURL: cred.user.photoURL,
      getIdToken: () => cred.user.getIdToken()
    };
  }

  // Resilient Local Mode
  const users = getLocalUsers();
  const lowerEmail = email.trim().toLowerCase();
  const existing = users[lowerEmail];

  if (!existing || existing.passHash !== pass) {
    // Allow instant login for demo email or create on the fly if test user
    if (lowerEmail === 'researcher@openscope.org' && pass === 'openscope123') {
      const demoUser: AppAuthUser = {
        uid: 'usr-elena-rostova-demo',
        email: 'researcher@openscope.org',
        displayName: 'Dr. Elena Rostova',
        getIdToken: async () => `demo-token-${Date.now()}-usr-elena-rostova-demo`
      };
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(demoUser));
      return demoUser;
    }
    throw new Error('Invalid email or password. Please verify your credentials or register a new account.');
  }

  const user: AppAuthUser = {
    uid: existing.uid,
    email: existing.email,
    displayName: existing.displayName,
    getIdToken: async () => `demo-token-${Date.now()}-${existing.uid}`
  };
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export async function registerWithEmail(email: string, pass: string, displayName: string): Promise<AppAuthUser> {
  if (auth) {
    const cred = await fbCreateUser(auth, email, pass);
    if (displayName) {
      await fbUpdateProfile(cred.user, { displayName });
    }
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: displayName || cred.user.displayName || email.split('@')[0],
      photoURL: cred.user.photoURL,
      getIdToken: () => cred.user.getIdToken()
    };
  }

  // Resilient Local Mode
  const users = getLocalUsers();
  const lowerEmail = email.trim().toLowerCase();

  if (users[lowerEmail]) {
    throw new Error('An account with this email address already exists. Please log in instead.');
  }

  const newUid = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  users[lowerEmail] = {
    uid: newUid,
    email: lowerEmail,
    displayName: displayName || email.split('@')[0],
    passHash: pass
  };
  saveLocalUsers(users);

  const newUser: AppAuthUser = {
    uid: newUid,
    email: lowerEmail,
    displayName: displayName || email.split('@')[0],
    getIdToken: async () => `demo-token-${Date.now()}-${newUid}`
  };
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

export async function loginAsDemoResearcher(): Promise<AppAuthUser> {
  const demoUser: AppAuthUser = {
    uid: 'usr-elena-rostova-demo',
    email: 'researcher@openscope.org',
    displayName: 'Dr. Elena Rostova',
    getIdToken: async () => `demo-token-${Date.now()}-usr-elena-rostova-demo`
  };
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(demoUser));
  return demoUser;
}

export async function performSignOut(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
  localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
}

export function subscribeToAuthState(callback: (user: AppAuthUser | null) => void): () => void {
  if (auth) {
    return fbOnAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Researcher',
          photoURL: fbUser.photoURL,
          getIdToken: () => fbUser.getIdToken()
        });
      } else {
        callback(null);
      }
    });
  }

  // Local fallback subscription
  try {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      callback({
        ...parsed,
        getIdToken: async () => `demo-token-${Date.now()}-${parsed.uid}`
      });
    } else {
      callback(null);
    }
  } catch (e) {
    callback(null);
  }

  // Handle cross-tab storage changes
  const listener = (e: StorageEvent) => {
    if (e.key === LOCAL_CURRENT_USER_KEY) {
      if (e.newValue) {
        const parsed = JSON.parse(e.newValue);
        callback({
          ...parsed,
          getIdToken: async () => `demo-token-${Date.now()}-${parsed.uid}`
        });
      } else {
        callback(null);
      }
    }
  };

  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
