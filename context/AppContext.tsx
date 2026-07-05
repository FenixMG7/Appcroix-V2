import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { Category, Family, FamilyMember } from '../types';
import { onAuthChange, getFamily, listenMembers, listenCategories } from '../services/firebaseService';

interface AppContextValue {
  user: User | null;
  authLoading: boolean;
  family: Family | null;
  familyLoading: boolean;
  refreshFamily: () => Promise<void>;
  members: FamilyMember[];
  categories: Category[];
  activeMemberId: string | null;
  setActiveMemberId: (id: string | null) => void;
  activeMember: FamilyMember | null;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Volontairement en mémoire seulement (pas de localStorage) : à chaque
  // rechargement de page, on repasse par l'écran "qui utilise ?", et
  // l'accès parent redemande donc le code PIN. Voir DEPLOYMENT.md.
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  useEffect(() => onAuthChange((u) => {
    setUser(u);
    setAuthLoading(false);
    if (!u) {
      setFamily(null);
      setFamilyLoading(false);
      setActiveMemberId(null);
    }
  }), []);

  const refreshFamily = useCallback(async () => {
    if (!user) return;
    setFamilyLoading(true);
    const f = await getFamily(user.uid);
    setFamily(f);
    setFamilyLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refreshFamily();
  }, [user, refreshFamily]);

  useEffect(() => {
    if (!user) {
      setMembers([]);
      return;
    }
    return listenMembers(user.uid, setMembers);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }
    return listenCategories(user.uid, setCategories);
  }, [user]);

  useEffect(() => {
    if (activeMemberId && !members.some((m) => m.id === activeMemberId)) {
      setActiveMemberId(null);
    }
  }, [members, activeMemberId]);

  const activeMember = members.find((m) => m.id === activeMemberId) || null;

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        family,
        familyLoading,
        refreshFamily,
        members,
        categories,
        activeMemberId,
        setActiveMemberId,
        activeMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() doit être appelé à l\'intérieur de <AppProvider>');
  return ctx;
};
