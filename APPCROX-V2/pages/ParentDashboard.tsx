import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  archiveMemberWeek,
  createCategory,
  updateCategory,
  deleteCategory,
  createMember,
  updateMember,
  deleteMember,
  signOutFamily,
} from '../services/firebaseService';
import { calculateWeeklyEarnings, getTotalCroix } from '../utils/rewards';
import { getAvatarComponent } from '../constants';
import AddCategoryForm from '../components/AddCategoryForm';
import { WeeklySummaryModal } from '../components/WeeklySummaryModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ReminderBanner from '../components/ReminderBanner';
import ProfilePicker, { ProfileDraft, emptyProfileDraft } from '../components/ProfilePicker';
import {
  ArrowLeftIcon,
  LogoutIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  HistoryIcon,
  UsersIcon,
  TagIcon,
  TrophyIcon,
} from '../components/icons';
import { Category, FamilyMember, WeeklyArchiveEntry } from '../types';

type Tab = 'overview' | 'categories' | 'profiles' | 'history';

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: TrophyIcon },
  { id: 'categories', label: 'Catégories', icon: TagIcon },
  { id: 'profiles', label: 'Profils', icon: UsersIcon },
  { id: 'history', label: 'Historique', icon: HistoryIcon },
];

// ---------------------------------------------------------------------------
// Onglet Vue d'ensemble
// ---------------------------------------------------------------------------
const OverviewTab: React.FC<{ childMembers: FamilyMember[]; onArchive: () => void }> = ({ childMembers, onArchive }) => (
  <div>
    <ReminderBanner members={childMembers} />

    {childMembers.length === 0 ? (
      <p className="text-slate-400 text-center py-10">Ajoute un profil enfant dans l'onglet « Profils ».</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {childMembers.map((child) => {
          const Avatar = getAvatarComponent(child.avatarId);
          const total = getTotalCroix(child.chores, child.bonusCroix);
          const earnings = calculateWeeklyEarnings(child.chores, child.bonusCroix);
          return (
            <div key={child.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 2px ${child.color}` }}>
                <Avatar />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{child.name}</p>
                <p className="text-sm text-slate-500">
                  {total} croix{child.bonusCroix > 0 ? ` (dont ${child.bonusCroix} bonus ⭐)` : ''} · {earnings.toFixed(2)} € cette semaine
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}

    <button
      type="button"
      onClick={onArchive}
      disabled={childMembers.length === 0}
      className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl shadow hover:bg-amber-600 transition disabled:bg-slate-200 disabled:text-slate-400"
    >
      Archiver la semaine
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Onglet Catégories
// ---------------------------------------------------------------------------
const CategoriesTab: React.FC<{
  categories: Category[];
  onAdd: (name: string, isPenible: boolean, bonusRatio: number | null) => void;
  onTogglePenible: (cat: Category) => void;
  onSetRatio: (cat: Category, ratio: number) => void;
  onDelete: (cat: Category) => void;
}> = ({ categories, onAdd, onTogglePenible, onSetRatio, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="space-y-2 mb-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-800">{cat.name}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer select-none">
                  Pénible
                  <button
                    type="button"
                    onClick={() => onTogglePenible(cat)}
                    className={`w-10 h-6 rounded-full transition relative ${cat.isPenible ? 'bg-amber-500' : 'bg-slate-200'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform ${cat.isPenible ? 'translate-x-4' : 'translate-x-0.5'}`}
                    />
                  </button>
                </label>
                <button type="button" onClick={() => onDelete(cat)} className="text-slate-400 hover:text-red-500 transition">
                  <TrashIcon />
                </button>
              </div>
            </div>
            {cat.isPenible && (
              <div className="flex items-center gap-2 mt-3 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                <StarIcon className="h-4 w-4" />
                <span>1 croix bonus toutes les</span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={cat.bonusRatio ?? 5}
                  onChange={(e) => onSetRatio(cat, Math.max(2, parseInt(e.target.value, 10) || 2))}
                  className="w-14 p-1 border border-amber-300 rounded text-center font-bold"
                />
                <span>croix</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition"
      >
        <PlusIcon /> Nouvelle catégorie
      </button>

      {showAdd && <AddCategoryForm onAddCategory={onAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Onglet Profils
// ---------------------------------------------------------------------------
const ProfilesTab: React.FC<{
  members: FamilyMember[];
  onSave: (draft: ProfileDraft & { role: 'parent' | 'child' }, editingId: string | null) => Promise<void>;
  onDelete: (member: FamilyMember) => void;
}> = ({ members, onSave, onDelete }) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft & { role: 'parent' | 'child' }>({ ...emptyProfileDraft(), role: 'child' });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setDraft({ ...emptyProfileDraft(), role: 'child' });
    setPanelOpen(true);
  };

  const openEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setDraft({ name: member.name, avatarId: member.avatarId, color: member.color, role: member.role });
    setPanelOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft, editingId);
      setPanelOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {members.map((member) => {
          const Avatar = getAvatarComponent(member.avatarId);
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => openEdit(member)}
              className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ boxShadow: `0 0 0 2px ${member.color}` }}>
                <Avatar />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{member.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{member.role === 'parent' ? 'Parent' : 'Enfant'}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition"
      >
        <PlusIcon /> Ajouter un profil
      </button>

      {panelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setPanelOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingId ? 'Modifier le profil' : 'Nouveau profil'}</h2>

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
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    const member = members.find((m) => m.id === editingId);
                    if (member) onDelete(member);
                    setPanelOpen(false);
                  }}
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
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Onglet Historique
// ---------------------------------------------------------------------------
const HistoryTab: React.FC<{ members: FamilyMember[]; categories: Category[] }> = ({ members, categories }) => {
  const withHistory = members.filter((m) => m.archive.length > 0);

  if (withHistory.length === 0) {
    return <p className="text-slate-400 text-center py-10">Aucune semaine archivée pour l'instant.</p>;
  }

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Catégorie supprimée';

  return (
    <div className="space-y-6">
      {withHistory.map((member) => {
        const Avatar = getAvatarComponent(member.avatarId);
        return (
          <div key={member.id}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px ${member.color}` }}>
                <Avatar />
              </div>
              <h3 className="font-bold text-slate-800">{member.name}</h3>
            </div>
            <div className="space-y-2">
              {member.archive.map((entry: WeeklyArchiveEntry, i: number) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-semibold text-slate-700 capitalize">{entry.weekOf}</span>
                    <span className="font-bold text-emerald-600">{entry.earnings.toFixed(2)} €</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(entry.byCategory)
                      .filter(([, count]) => count > 0)
                      .map(([catId, count]) => (
                        <span key={catId} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {categoryName(catId)} × {count}
                        </span>
                      ))}
                    {entry.bonusCroix > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <StarIcon className="h-3 w-3" /> {entry.bonusCroix} bonus
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------
const ParentDashboard: React.FC = () => {
  const { user, activeMember, members, categories, setActiveMemberId } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('overview');
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [archivedSnapshot, setArchivedSnapshot] = useState<FamilyMember[] | null>(null);

  if (!activeMember || activeMember.role !== 'parent') {
    return <Navigate to="/select-profile" replace />;
  }

  const children = members.filter((m) => m.role === 'child');

  const changeProfile = () => {
    setActiveMemberId(null);
    navigate('/select-profile');
  };

  const handleArchive = async () => {
    if (!user) return;
    const snapshot = children.map((c) => ({ ...c }));
    setArchivedSnapshot(snapshot);
    await Promise.all(
      snapshot.map((child) => {
        const earnings = calculateWeeklyEarnings(child.chores, child.bonusCroix);
        const entry: WeeklyArchiveEntry = {
          weekOf: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          totalChores: getTotalCroix(child.chores, child.bonusCroix),
          bonusCroix: child.bonusCroix,
          earnings,
          byCategory: { ...child.chores },
        };
        return archiveMemberWeek(user.uid, child.id, entry, child.totalEarnings + earnings, child.archive);
      })
    );
    setConfirmArchive(false);
    setShowSummary(true);
  };

  const handleAddCategory = (name: string, isPenible: boolean, bonusRatio: number | null) => {
    if (!user) return;
    createCategory(user.uid, { name, isPenible, bonusRatio });
  };

  const handleTogglePenible = (cat: Category) => {
    if (!user) return;
    const nextIsPenible = !cat.isPenible;
    updateCategory(user.uid, cat.id, { isPenible: nextIsPenible, bonusRatio: nextIsPenible ? cat.bonusRatio ?? 5 : null });
  };

  const handleSetRatio = (cat: Category, ratio: number) => {
    if (!user) return;
    updateCategory(user.uid, cat.id, { bonusRatio: ratio });
  };

  const handleDeleteCategory = (cat: Category) => {
    if (!user) return;
    deleteCategory(user.uid, cat.id);
  };

  const handleSaveProfile = async (draft: ProfileDraft & { role: 'parent' | 'child' }, editingId: string | null) => {
    if (!user || !draft.name.trim()) return;
    if (editingId) {
      await updateMember(user.uid, editingId, {
        name: draft.name.trim(),
        avatarId: draft.avatarId,
        color: draft.color,
        role: draft.role,
      });
    } else {
      await createMember(user.uid, draft.name.trim(), draft.avatarId, draft.color, draft.role);
    }
  };

  const handleDeleteProfile = (member: FamilyMember) => {
    if (!user) return;
    deleteMember(user.uid, member.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button type="button" onClick={changeProfile} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="font-semibold">Centre de contrôle</span>
          </button>
          <button type="button" onClick={() => signOutFamily()} className="text-slate-400 hover:text-red-500 transition" aria-label="Se déconnecter">
            <LogoutIcon />
          </button>
        </div>
        <nav className="max-w-2xl mx-auto px-5 flex gap-1 overflow-x-auto pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                tab === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {tab === 'overview' && <OverviewTab childMembers={children} onArchive={() => setConfirmArchive(true)} />}
        {tab === 'categories' && (
          <CategoriesTab
            categories={categories}
            onAdd={handleAddCategory}
            onTogglePenible={handleTogglePenible}
            onSetRatio={handleSetRatio}
            onDelete={handleDeleteCategory}
          />
        )}
        {tab === 'profiles' && <ProfilesTab members={members} onSave={handleSaveProfile} onDelete={handleDeleteProfile} />}
        {tab === 'history' && <HistoryTab members={members} categories={categories} />}
      </main>

      <ConfirmationModal
        isOpen={confirmArchive}
        title="Archiver la semaine ?"
        message="Les compteurs de tous les enfants seront remis à zéro et les gains ajoutés à leur total."
        confirmLabel="Oui, archiver"
        onConfirm={handleArchive}
        onClose={() => setConfirmArchive(false)}
      />

      {showSummary && archivedSnapshot && (
        <WeeklySummaryModal
          members={archivedSnapshot}
          onComplete={() => {
            setShowSummary(false);
            setArchivedSnapshot(null);
          }}
        />
      )}
    </div>
  );
};

export default ParentDashboard;
