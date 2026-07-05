import React, { useState } from 'react';
import { PlusIcon } from './icons';

interface AddCategoryFormProps {
  onAddCategory: (name: string, isPenible: boolean, bonusRatio: number | null) => void;
  onClose: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onAddCategory, onClose }) => {
  const [name, setName] = useState('');
  const [isPenible, setIsPenible] = useState(false);
  const [bonusRatio, setBonusRatio] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory(name.trim(), isPenible, isPenible ? bonusRatio : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Nouvelle tâche</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ranger sa chambre"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition mb-4"
            autoFocus
          />

          <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg mb-3 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Tâche pénible</div>
              <div className="text-xs text-slate-500">Ouvre droit à des croix bonus, et peut être exclue pour un enfant absent/fatigué</div>
            </div>
            <input
              type="checkbox"
              checked={isPenible}
              onChange={(e) => setIsPenible(e.target.checked)}
              className="h-5 w-5 accent-amber-500 flex-shrink-0"
            />
          </label>

          {isPenible && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg mb-4">
              <span className="text-sm text-amber-800 flex-shrink-0">1 croix bonus toutes les</span>
              <input
                type="number"
                min={2}
                max={20}
                value={bonusRatio}
                onChange={(e) => setBonusRatio(Math.max(2, parseInt(e.target.value, 10) || 2))}
                className="w-16 p-2 border border-amber-300 rounded-lg text-center font-bold"
              />
              <span className="text-sm text-amber-800">croix</span>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-indigo-300"
              disabled={!name.trim()}
            >
              <PlusIcon /> Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;
