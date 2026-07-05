import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { saveMemberChores } from '../services/firebaseService';
import { getAvatarComponent } from '../constants';
import { applyMarkChore, applyUnmarkChore, calculateWeeklyEarnings, getTotalCroix } from '../utils/rewards';
import { REWARD_TIER_1_CHORES, REWARD_TIER_1_CASH, REWARD_TIER_2_CHORES, REWARD_TIER_2_CASH } from '../constants';
import Confetti from '../components/Confetti';
import RewardToast from '../components/RewardToast';
import { ArrowLeftIcon, PlusIcon, MinusIcon, StarIcon } from '../components/icons';
import { Category } from '../types';

const CATEGORY_EMOJI: { keywords: string[]; emoji: string }[] = [
  { keywords: ['table'], emoji: '🍽️' },
  { keywords: ['chambre', 'lit'], emoji: '🛏️' },
  { keywords: ['poubelle'], emoji: '🗑️' },
  { keywords: ['vaisselle'], emoji: '🍽️' },
  { keywords: ['linge', 'lessive'], emoji: '🧺' },
  { keywords: ['animal', 'chien', 'chat'], emoji: '🐾' },
  { keywords: ['jardin', 'plante'], emoji: '🌱' },
  { keywords: ['aspirateur', 'balai', 'sol'], emoji: '🧹' },
];

const guessEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  const match = CATEGORY_EMOJI.find((c) => c.keywords.some((k) => lower.includes(k)));
  return match?.emoji || '✅';
};

const ChildDashboard: React.FC = () => {
  const { activeMember, categories, user, setActiveMemberId } = useApp();
  const navigate = useNavigate();

  const [reward, setReward] = useState<{ amount: number } | null>(null);
  const [confettiFiring, setConfettiFiring] = useState(false);
  const [bonusPopup, setBonusPopup] = useState<string | null>(null);

  if (!activeMember || activeMember.role !== 'child') {
    return <Navigate to="/select-profile" replace />;
  }

  const changeProfile = () => {
    setActiveMemberId(null);
    navigate('/select-profile');
  };

  const fireCelebration = (amount: number) => {
    setReward({ amount });
    setConfettiFiring(true);
    setTimeout(() => setConfettiFiring(false), 100);
    setTimeout(() => setReward(null), 3000);
  };

  const popBonus = (categoryName: string) => {
    setBonusPopup(categoryName);
    setTimeout(() => setBonusPopup(null), 1800);
  };

  const handleMark = async (category: Category) => {
    if (!user) return;
    const before = calculateWeeklyEarnings(activeMember.chores, activeMember.bonusCroix);
    const delta = applyMarkChore(activeMember, category);
    const after = calculateWeeklyEarnings(delta.chores, delta.bonusCroix);

    await saveMemberChores(user.uid, activeMember.id, delta.chores, delta.bonusCroix);

    if (delta.bonusGained) popBonus(category.name);
    if (after > before) fireCelebration(after);
  };

  const handleUnmark = async (category: Category) => {
    if (!user) return;
    const delta = applyUnmarkChore(activeMember, category);
    await saveMemberChores(user.uid, activeMember.id, delta.chores, delta.bonusCroix);
  };

  const AvatarComponent = getAvatarComponent(activeMember.avatarId);
  const total = getTotalCroix(activeMember.chores, activeMember.bonusCroix);
  const progressPct = Math.min(100, (total / REWARD_TIER_2_CHORES) * 100);
  const tier1Pct = (REWARD_TIER_1_CHORES / REWARD_TIER_2_CHORES) * 100;

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: `radial-gradient(circle at top, ${activeMember.color}22, #FAFAFA 55%)` }}
    >
      <Confetti isFiring={confettiFiring} />
      <RewardToast reward={reward} />

      {bonusPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div className="flex items-center gap-2 bg-amber-400 text-white font-bold px-5 py-3 rounded-full shadow-lg animate-bonus-pop">
            <StarIcon className="h-5 w-5" /> Croix bonus : {bonusPopup} !
          </div>
          <style>{`
            @keyframes bonus-pop {
              0% { transform: translateY(-20px) scale(0.8); opacity: 0; }
              20% { transform: translateY(0) scale(1.05); opacity: 1; }
              80% { transform: translateY(0) scale(1); opacity: 1; }
              100% { transform: translateY(-10px) scale(0.95); opacity: 0; }
            }
            .animate-bonus-pop { animation: bonus-pop 1.8s ease-out forwards; }
          `}</style>
        </div>
      )}

      <header className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        <button
          type="button"
          onClick={changeProfile}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition mb-4 text-sm font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Changer de profil
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 4px ${activeMember.color}` }}>
            <AvatarComponent />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Salut {activeMember.name} !</h1>
            <p className="text-slate-500">Total cumulé : {activeMember.totalEarnings.toFixed(2)} €</p>
          </div>
        </div>

        <div className="mt-6 bg-white/70 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
            <span>{total} croix cette semaine</span>
            <span>{REWARD_TIER_2_CHORES} = objectif max</span>
          </div>
          <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
            <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left: `${tier1Pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{REWARD_TIER_1_CHORES} croix → {REWARD_TIER_1_CASH} €</span>
            <span>{REWARD_TIER_2_CHORES} croix → {REWARD_TIER_2_CASH} €</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-10">
            Pas encore de catégorie. Demande à un parent d'en ajouter !
          </p>
        )}
        {categories.map((category) => {
          const count = activeMember.chores[category.id] || 0;
          const bonusProgress = category.isPenible && category.bonusRatio ? count % category.bonusRatio : null;

          return (
            <div key={category.id} className="bg-white rounded-3xl shadow-md border-4 p-5" style={{ borderColor: `${activeMember.color}33` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-3xl mb-1">{guessEmoji(category.name)}</div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{category.name}</h3>
                </div>
                {category.isPenible && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full whitespace-nowrap">
                    Pénible
                  </span>
                )}
              </div>

              {category.isPenible && category.bonusRatio && (
                <div className="text-xs text-amber-600 font-semibold mb-3 flex items-center gap-1">
                  <StarIcon className="h-3.5 w-3.5" /> {bonusProgress}/{category.bonusRatio} vers la prochaine bonus
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleUnmark(category)}
                  disabled={count === 0}
                  className="h-11 w-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 transition"
                  aria-label={`Retirer une croix pour ${category.name}`}
                >
                  <MinusIcon />
                </button>
                <span className="text-4xl font-extrabold text-slate-800 tabular-nums">{count}</span>
                <button
                  type="button"
                  onClick={() => handleMark(category)}
                  className="h-14 w-14 rounded-full text-white flex items-center justify-center shadow-lg active:scale-90 transition"
                  style={{ backgroundColor: activeMember.color }}
                  aria-label={`Ajouter une croix pour ${category.name}`}
                >
                  <PlusIcon className="h-7 w-7" />
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default ChildDashboard;
