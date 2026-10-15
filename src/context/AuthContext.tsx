import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppAuthUser,
  subscribeToAuthState,
  authenticateWithEmail,
  registerWithEmail,
  loginAsDemoResearcher,
  performSignOut
} from '../lib/firebase';
import { UserProfile, UserMemory, ResearchSource } from '../types';
import { DEFAULT_USER_SETTINGS } from '../lib/researchData';

interface AuthContextType {
  user: AppAuthUser | null;
  profile: UserProfile | null;
  memory: UserMemory | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  updateMemory: (updater: (prev: UserMemory) => UserMemory) => void;
  recordSearch: (query: string, count: number) => void;
  recordViewedSource: (source: ResearchSource) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createInitialMemory(uid: string): UserMemory {
  return {
    uid,
    recentSearches: [
      { query: 'Quantum Error Correction', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), resultsCount: 42 },
      { query: 'Solid-State Electrolytes', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), resultsCount: 38 },
      { query: 'CRISPR Prime Editing', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), resultsCount: 56 }
    ],
    frequentlyResearchedTopics: [
      { topic: 'Quantum Computing', count: 8, lastSearched: new Date(Date.now() - 3600000 * 4).toISOString() },
      { topic: 'Solid-State Physics', count: 5, lastSearched: new Date(Date.now() - 3600000 * 24).toISOString() },
      { topic: 'Gene Editing', count: 3, lastSearched: new Date(Date.now() - 3600000 * 48).toISOString() }
    ],
    savedPaperCount: 14,
    activeInvestigationCount: 3,
    completedInvestigationCount: 1,
    pinnedFindingCount: 7,
    preferredResearchTopics: ['Quantum Computing', 'Condensed Matter Physics', 'Biotechnology', 'Machine Learning'],
    recentlyViewedSources: [],
    uiPreferences: {
      defaultDataSource: 'all',
      graphLayout: 'cose',
      activeView: 'dashboard',
      themeDensity: 'comfortable'
    },
    updatedAt: new Date().toISOString()
  };
}

function createInitialProfile(user: AppAuthUser): UserProfile {
  return {
    uid: user.uid,
    email: user.email || 'researcher@openscope.org',
    displayName: user.displayName || 'Research Scholar',
    role: 'Lead Investigator',
    organization: 'Open Intelligence Lab',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: DEFAULT_USER_SETTINGS
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memory, setMemory] = useState<UserMemory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync memory to backend and localStorage
  const syncMemoryToServer = useCallback(async (mem: UserMemory, token?: string) => {
    try {
      localStorage.setItem(`openscope_memory_${mem.uid}`, JSON.stringify(mem));
      await fetch('/api/user-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-user-id': mem.uid
        },
        body: JSON.stringify(mem)
      });
    } catch (e) {
      // Local caching ensures resilience
    }
  }, []);

  // Sync profile to backend and localStorage
  const syncProfileToServer = useCallback(async (prof: UserProfile, token?: string) => {
    try {
      localStorage.setItem(`openscope_profile_${prof.uid}`, JSON.stringify(prof));
      await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-user-id': prof.uid
        },
        body: JSON.stringify(prof)
      });
    } catch (e) {
      // Local caching ensures resilience
    }
  }, []);

  // Load user data on auth state change
  const loadUserData = useCallback(async (authUser: AppAuthUser) => {
    try {
      const token = await authUser.getIdToken();

      // 1. Load or initialize profile
      let loadedProfile: UserProfile | null = null;
      try {
        const res = await fetch('/api/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': authUser.uid
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) loadedProfile = data.profile;
        }
      } catch (e) {
        // Fallback
      }

      if (!loadedProfile) {
        const cached = localStorage.getItem(`openscope_profile_${authUser.uid}`);
        if (cached) {
          try { loadedProfile = JSON.parse(cached); } catch (e) {}
        }
      }

      if (!loadedProfile) {
        loadedProfile = createInitialProfile(authUser);
        await syncProfileToServer(loadedProfile, token);
      } else {
        loadedProfile = {
          ...loadedProfile,
          lastLoginAt: new Date().toISOString(),
          displayName: authUser.displayName || loadedProfile.displayName
        };
        await syncProfileToServer(loadedProfile, token);
      }
      setProfile(loadedProfile);

      // 2. Load or initialize memory
      let loadedMemory: UserMemory | null = null;
      try {
        const res = await fetch('/api/user-memory', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': authUser.uid
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.memory) loadedMemory = data.memory;
        }
      } catch (e) {
        // Fallback
      }

      if (!loadedMemory) {
        const cached = localStorage.getItem(`openscope_memory_${authUser.uid}`);
        if (cached) {
          try { loadedMemory = JSON.parse(cached); } catch (e) {}
        }
      }

      if (!loadedMemory) {
        loadedMemory = createInitialMemory(authUser.uid);
        await syncMemoryToServer(loadedMemory, token);
      }
      setMemory(loadedMemory);
    } catch (err) {
      console.warn('Error synchronizing user memory/profile:', err);
    }
  }, [syncMemoryToServer, syncProfileToServer]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentAuthUser) => {
      setUser(currentAuthUser);
      if (currentAuthUser) {
        await loadUserData(currentAuthUser);
      } else {
        setProfile(null);
        setMemory(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const authUser = await authenticateWithEmail(email, pass);
      setUser(authUser);
      await loadUserData(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, displayName: string) => {
    setIsLoading(true);
    try {
      const authUser = await registerWithEmail(email, pass, displayName);
      setUser(authUser);
      await loadUserData(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signInDemo = async () => {
    setIsLoading(true);
    try {
      const authUser = await loginAsDemoResearcher();
      setUser(authUser);
      await loadUserData(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await performSignOut();
      setUser(null);
      setProfile(null);
      setMemory(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) return;
    const updated: UserProfile = { ...profile, ...updates };
    setProfile(updated);
    const token = await user.getIdToken();
    await syncProfileToServer(updated, token);
  };

  const updateMemory = useCallback((updater: (prev: UserMemory) => UserMemory) => {
    if (!user) return;
    setMemory((prev) => {
      const current = prev || createInitialMemory(user.uid);
      const updated = updater(current);
      user.getIdToken().then(token => syncMemoryToServer(updated, token));
      return updated;
    });
  }, [user, syncMemoryToServer]);

  const recordSearch = useCallback((query: string, count: number) => {
    if (!query.trim()) return;
    updateMemory((prev) => {
      const cleanQuery = query.trim();
      const now = new Date().toISOString();

      // Update recent searches (prepend & cap to 25)
      const existingSearches = prev.recentSearches.filter(s => s.query.toLowerCase() !== cleanQuery.toLowerCase());
      const newRecentSearches = [
        { query: cleanQuery, timestamp: now, resultsCount: count },
        ...existingSearches
      ].slice(0, 25);

      // Update frequency
      const freqMap = [...prev.frequentlyResearchedTopics];
      const matchIdx = freqMap.findIndex(f => f.topic.toLowerCase() === cleanQuery.toLowerCase());
      if (matchIdx !== -1) {
        freqMap[matchIdx] = {
          ...freqMap[matchIdx],
          count: freqMap[matchIdx].count + 1,
          lastSearched: now
        };
      } else {
        freqMap.push({ topic: cleanQuery, count: 1, lastSearched: now });
      }
      freqMap.sort((a, b) => b.count - a.count);

      return {
        ...prev,
        recentSearches: newRecentSearches,
        frequentlyResearchedTopics: freqMap.slice(0, 15),
        updatedAt: now
      };
    });
  }, [updateMemory]);

  const recordViewedSource = useCallback((source: ResearchSource) => {
    if (!source || !source.id) return;
    updateMemory((prev) => {
      const now = new Date().toISOString();
      const existing = prev.recentlyViewedSources.filter(s => s.id !== source.id);
      const newViewed = [
        {
          id: source.id,
          title: source.title,
          source: source.source,
          year: source.year,
          viewedAt: now,
          url: source.url
        },
        ...existing
      ].slice(0, 20);

      return {
        ...prev,
        recentlyViewedSources: newViewed,
        updatedAt: now
      };
    });
  }, [updateMemory]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        memory,
        isLoading,
        signIn,
        signUp,
        signInDemo,
        signOut,
        updateProfileData,
        updateMemory,
        recordSearch,
        recordViewedSource
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
