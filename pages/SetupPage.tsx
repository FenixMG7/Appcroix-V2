import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createMember, createCategory, completeSetup } from '../services/firebaseService';
import { AVATARS, DEFAULT_CATEGORY_SEEDS } from '../constants';
import ProfilePicker, { ProfileDraft, emptyProfileDraft } from '../components/ProfilePicker';
import { PlusIcon, TrashIcon, LockIcon, ExclamationTriangleIcon } from '../components/icons';

interface DraftProfile extends ProfileDraft {
  tempId: string;
}

const emptyDraft = (): DraftProfile => ({
  tempId: `d-${Date.now()}-${Math.random()}`,
  ...emptyProfileDraft(),
});

const ProfileListStep: React.FC<{
  title: string;
  subtitle: string;
  role: 'parent' | 'child';
  profiles: DraftProfile[];
  setProfiles: (p: DraftProfile[]) => void;
}> = ({ title, subtitle, role, profiles, setProfiles }) => {
  const [draft, setDraft] = useState<DraftProfile | null>(profiles.length === 0 ? emptyDraft() : null);

  const addDraft = () => {
    if (!draft || !draft.name.trim()) return;
    setProfiles([...profiles, { ...draft, name: draft.name.trim() }]);
    setDraft(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-slate-500 mb-6">{subtitle}</p>

      {profiles.length > 0 && (
        <div className="space-y-2 mb-4">
          {profiles.map((p) => {
            const Avatar = AVATARS.find((a) => a.id === p.avatarId)?.component || AVATARS[0].component;
            return (
              <div key={p.tempId} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 2px ${p.color}` }}>
                  <Avatar />
                </div>
                <span className="font-medium text-slate-700 flex-1">{p.name}</span>
                <button
                  type="button"
                  onClick={() => setProfiles(profiles.filter((x) => x.tempId !== p.tempId))}
                  className="text-slate-400 hover:text-red-500 transition"
                  aria-label={`Retirer ${p.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {draft ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <ProfilePicker draft={draft} onChange={(updated) => setDraft({ ...draft, ...updated })} />
          <div className="flex gap-3 mt-4">
            {profiles.length > 0 && (
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">
                Annuler
              </button>
            )}
            <button
              type="button"
              onClick={addDraft}
              disabled={!draft.name.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-indigo-300"
            >
              Ajouter ce profil
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition"
        >
          <PlusIcon /> Ajouter {role === 'parent' ? 'un parent' : 'un enfant'}
        </button>
      )}
    </div>
  );
};

const SetupPage: React.FC = () => {
  const { user, family, familyLoading, refreshFamily } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [parents, setParents] = useState<DraftProfile[]>([]);
  const [children, setChildren] = useState<DraftProfile[]>([]);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!familyLoading && family?.setupComplete) {
    return <Navigate to="/select-profile" replace />;
  }

  const steps = ['Parents', 'Enfants', 'Code PIN'];

  const handleFinish = async () => {
    setError(null);
    if (!/^\d{4}$/.test(pin)) {
      setError('Le code doit faire exactement 4 chiffres.');
      return;
    }
    if (pin !== confirmPin) {
      setError('Les deux codes ne correspondent pas.');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await Promise.all([
        ...parents.map((p) => createMember(user.uid, p.name, p.avatarId, p.color, 'parent')),
        ...children.map((c) => createMember(user.uid, c.name, c.avatarId, c.color, 'child')),
        ...DEFAULT_CATEGORY_SEEDS.map((cat) => createCategory(user.uid, cat)),
      ]);
      await completeSetup(user.uid, pin);
      await refreshFamily();
      navigate('/select-profile', { replace: true });
    } catch {
      setError('Erreur pendant la création du compte. Réessaie.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-indigo-300' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {step === 0 && (
            <ProfileListStep
              title="Les parents"
              subtitle="Qui gère App Croix dans la famille ?"
              role="parent"
              profiles={parents}
              setProfiles={setParents}
            />
          )}

          {step === 1 && (
            <ProfileListStep
              title="Les enfants"
              subtitle="Qui va cocher des croix cette semaine ?"
              role="child"
              profiles={children}
              setProfiles={setChildren}
            />
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <LockIcon className="h-10 w-10 mx-auto text-indigo-500 mb-2" />
                <h2 className="text-2xl font-bold text-slate-800">Code parent</h2>
                <p className="text-slate-500">4 chiffres, demandés pour ouvrir l'espace parent</p>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Code (4 chiffres)"
                  className="w-full p-3 text-center text-2xl tracking-[0.5em] border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Confirme le code"
                  className="w-full p-3 text-center text-2xl tracking-[0.5em] border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg mt-4">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 bg-slate-100 text-slate-600 rounded-lg font-semibold"
              >
                Retour
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 0 ? parents.length === 0 : children.length === 0}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-indigo-300"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting || pin.length !== 4}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-semibold disabled:bg-emerald-300"
              >
                {submitting ? 'Création...' : 'Terminer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
