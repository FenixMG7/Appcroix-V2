import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { verifyParentPin } from '../services/firebaseService';
import { AVATARS } from '../constants';
import { LockIcon, ArrowLeftIcon } from '../components/icons';

const ParentPinPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const { user, members, setActiveMemberId } = useApp();
  const navigate = useNavigate();

  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);

  const parent = members.find((m) => m.id === memberId && m.role === 'parent');

  if (!parent) {
    return <Navigate to="/select-profile" replace />;
  }

  const Avatar = AVATARS.find((a) => a.id === parent.avatarId)?.component || AVATARS[0].component;

  const submitPin = async (value: string) => {
    if (!user) return;
    setChecking(true);
    const ok = await verifyParentPin(user.uid, value);
    setChecking(false);
    if (ok) {
      setActiveMemberId(parent.id);
      navigate('/parent');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || checking) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      submitPin(next);
    }
  };

  const handleBackspace = () => setPin(pin.slice(0, -1));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>

      <button
        type="button"
        onClick={() => navigate('/select-profile')}
        className="self-start mb-6 flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Retour
      </button>

      <div className="w-16 h-16 rounded-full overflow-hidden mb-3" style={{ boxShadow: `0 0 0 3px ${parent.color}` }}>
        <Avatar />
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Code de {parent.name}</h1>
      <p className="text-slate-500 flex items-center gap-1.5 mb-6">
        <LockIcon className="h-4 w-4" /> Entre le code à 4 chiffres
      </p>

      <div className={`flex gap-3 mb-8 ${shake ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="h-16 w-16 rounded-full bg-white shadow text-2xl font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-16 w-16 rounded-full bg-white shadow text-2xl font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-16 w-16 rounded-full text-slate-400 hover:text-slate-600 transition text-sm font-semibold"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default ParentPinPage;
