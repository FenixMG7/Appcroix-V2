import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createMember, updateMember, deleteMember, signOutFamily } from '../services/firebaseService';
import { AVATARS } from '../constants';
import { FamilyMember } from '../types';
import ProfilePicker, { ProfileDraft, emptyProfileDraft } from '../components/ProfilePicker';
import ConfirmationModal from '../components/ConfirmationModal';
import { PlusIcon, SettingsIcon, LogoutIcon, XIcon, TrashIcon } from '../components/icons';

const ProfileSelectPage: React.FC = () => {
  const { user, members, setActiveMemberId } = useApp();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [panel, setPanel] = useState<'add' | { editing: FamilyMember } | null>(null);
  const [draft, setDraft] = useState<ProfileDraft & { role: 'parent' | 'child' }>({ ...emptyProfileDraft(), role: 'child' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<FamilyMember | null>(null);

  const handleSelect = (member: FamilyMember) => {
    if (editMode) {
      setPanel({ editing: member });
      setDraft({ name: member.name, avatarId: member.avatarId, color: member.color, role: member.role });
      return;
    }
    if (member.role === 'child') {
      setActiveMemberId(member.id);
      navigate('/child');
    } else {
      navigate(`/parent-pin/${member.id}`);
    }
  };

  const openAddPanel = () => {
    setDraft({ ...emptyProfileDraft(), role: 'child' });
    setPanel('add');
  };

  const closePanel = () => setPanel(null);

  const handleSave = async () => {
    if (!user || !draft.name.trim()) return;
    setSaving(true);
    try {
      if (panel && typeof panel === 'object' && 'editing' in panel) {
        await updateMember(user.uid, panel.editing.id, {
          name: draft.name.trim(),
          avatarId: draft.avatarId,
          color: draft.color,
          role: draft.role,
        });
      } else {
        await createMember(user.uid, draft.name.trim(), draft.avatarId, draft.color, draft.role);
      }
      closePanel();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !confirmDelete) return;
    await deleteMember(user.uid, confirmDelete.id);
    setConfirmDelete(null);
    closePanel();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Qui utilise App Croix ?</h1>
      <p className="text-slate-500 mb-8">Choisis ton profil</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 max-w-lg mb-8">
        {members.map((member) => {
          const Avatar = AVATARS.find((a) => a.id === member.avatarId)?.component || AVATARS[0].component;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => handleSelect(member)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden transition group-hover:scale-105 ${editMode ? 'animate-pulse' : ''}`}
                  style={{ boxShadow: `0 0 0 3px ${member.color}` }}
                >
                  <Avatar />
                </div>
                {editMode && (
                  <span className="absolute -top-1 -right-1 bg-slate-700 text-white rounded-full p-1">
                    <SettingsIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <span className="font-semibold text-slate-700 truncate max-w-[5rem]">{member.name}</span>
              {member.role === 'parent' && <span className="text-[10px] uppercase tracking-wide text-slate-400">Parent</span>}
            </button>
          );
        })}

        <button type="button" onClick={openAddPanel} className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition">
            <PlusIcon className="h-8 w-8" />
          </div>
          <span className="font-medium text-slate-400">Ajouter</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${editMode ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          {editMode ? 'Terminé' : 'Modifier les profils'}
        </button>
        <button
          type="button"
          onClick={() => signOutFamily()}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition"
        >
          <LogoutIcon className="h-4 w-4" /> Se déconnecter
        </button>
      </div>

      {panel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closePanel}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const editingMember = panel !== 'add' ? panel.editing : null;
              return (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">{editingMember ? 'Modifier le profil' : 'Nouveau profil'}</h2>
                    <button type="button" onClick={closePanel} className="text-slate-400 hover:text-slate-600">
                      <XIcon />
                    </button>
                  </div>

                  <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, role: 'child' })}
                      className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition ${draft.role === 'child' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                    >
                      Enfant
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, role: 'parent' })}
                      className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition ${draft.role === 'parent' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                    >
                      Parent
                    </button>
                  </div>

                  <ProfilePicker draft={draft} onChange={(updated) => setDraft({ ...draft, ...updated })} />

                  <div className="flex gap-3 mt-5">
                    {editingMember && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(editingMember)}
                        className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                        aria-label="Supprimer ce profil"
                      >
                        <TrashIcon />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !draft.name.trim()}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-indigo-300"
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(confirmDelete)}
        title={confirmDelete ? `Supprimer ${confirmDelete.name} ?` : ''}
        message="Ce profil et son historique seront définitivement supprimés."
        confirmLabel="Oui, supprimer"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ProfileSelectPage;
