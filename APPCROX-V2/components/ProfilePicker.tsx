import React from 'react';
import { AVATARS, PROFILE_COLORS } from '../constants';

export interface ProfileDraft {
  name: string;
  avatarId: string;
  color: string;
}

export const emptyProfileDraft = (): ProfileDraft => ({
  name: '',
  avatarId: AVATARS[0].id,
  color: PROFILE_COLORS[Math.floor(Math.random() * PROFILE_COLORS.length)],
});

interface ProfilePickerProps {
  draft: ProfileDraft;
  onChange: (d: ProfileDraft) => void;
  autoFocus?: boolean;
}

/** Formulaire réutilisable : prénom + avatar + couleur d'accent. */
const ProfilePicker: React.FC<ProfilePickerProps> = ({ draft, onChange, autoFocus = true }) => (
  <div className="space-y-3">
    <input
      type="text"
      value={draft.name}
      onChange={(e) => onChange({ ...draft, name: e.target.value })}
      placeholder="Prénom"
      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      autoFocus={autoFocus}
    />
    <div>
      <div className="text-xs font-medium text-slate-500 mb-2">Avatar</div>
      <div className="grid grid-cols-6 gap-2">
        {AVATARS.map(({ id, component: Avatar }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange({ ...draft, avatarId: id })}
            className={`rounded-full overflow-hidden transition ${draft.avatarId === id ? 'ring-4 ring-indigo-500' : 'ring-2 ring-transparent opacity-60 hover:opacity-100'}`}
          >
            <Avatar />
          </button>
        ))}
      </div>
    </div>
    <div>
      <div className="text-xs font-medium text-slate-500 mb-2">Couleur</div>
      <div className="flex gap-2">
        {PROFILE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ ...draft, color: c })}
            className={`h-8 w-8 rounded-full transition ${draft.color === c ? 'ring-4 ring-offset-2 ring-slate-400' : ''}`}
            style={{ backgroundColor: c }}
            aria-label={`Choisir la couleur ${c}`}
          />
        ))}
      </div>
    </div>
  </div>
);

export default ProfilePicker;
