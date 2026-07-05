import React, { useState } from 'react';
import { signInFamily, signUpFamily } from '../services/firebaseService';
import { MailIcon, LockIcon, ExclamationTriangleIcon } from '../components/icons';

const friendlyError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email. Essaie de te connecter.';
    case 'auth/invalid-email':
      return "Cet email n'a pas l'air valide.";
    case 'auth/weak-password':
      return 'Le mot de passe doit faire au moins 6 caractères.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessaie dans quelques minutes.';
    default:
      return "Une erreur est survenue. Réessaie.";
  }
};

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpFamily(email.trim(), password);
      } else {
        await signInFamily(email.trim(), password);
      }
      // Pas besoin de navigate() ici : le contexte détecte le changement
      // d'utilisateur Firebase et App.tsx redirige automatiquement.
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      setError(friendlyError(code));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-3xl font-bold text-slate-800">App Croix</h1>
          <p className="text-slate-500 mt-1">Le tableau de tâches de la famille</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === 'login' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === 'signup' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Email de la famille</label>
              <div className="relative">
                <MailIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="famille@exemple.fr"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Mot de passe</label>
              <div className="relative">
                <LockIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Confirme le mot de passe</label>
                <div className="relative">
                  <LockIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:bg-indigo-300"
            >
              {loading ? 'Un instant...' : mode === 'signup' ? 'Créer le compte famille' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Un seul compte par famille. Une fois connecté·e, chacun choisit son profil.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
