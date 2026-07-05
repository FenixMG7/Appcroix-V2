import React from 'react';
import { Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6 } from './components/avatars';
import { Category } from './types';

export const REWARD_TIER_1_CHORES = 10;
export const REWARD_TIER_1_CASH = 3;
export const REWARD_TIER_1_CATEGORIES = 2;

export const REWARD_TIER_2_CHORES = 15;
export const REWARD_TIER_2_CASH = 5;
export const REWARD_TIER_2_CATEGORIES = 3;

export const AVATARS: { id: string; component: React.FC }[] = [
  { id: 'avatar1', component: Avatar1 },
  { id: 'avatar2', component: Avatar2 },
  { id: 'avatar3', component: Avatar3 },
  { id: 'avatar4', component: Avatar4 },
  { id: 'avatar5', component: Avatar5 },
  { id: 'avatar6', component: Avatar6 },
];

export const getAvatarComponent = (avatarId?: string) => {
  return AVATARS.find((a) => a.id === avatarId)?.component || Avatar1;
};

/** Palette de couleurs d'accent proposées à la création d'un profil. */
export const PROFILE_COLORS: string[] = [
  '#F43F5E', // rose
  '#F59E0B', // ambre
  '#10B981', // émeraude
  '#3B82F6', // bleu
  '#8B5CF6', // violet
  '#14B8A6', // turquoise
];

/**
 * Catégories proposées par défaut lors du setup (le parent peut tout
 * modifier / supprimer ensuite). "Débarrasser la table" est pré-réglée en
 * pénible avec un ratio de 5, comme exemple donné pour la croix bonus.
 */
export const DEFAULT_CATEGORY_SEEDS: Omit<Category, 'id'>[] = [
  { name: 'Mettre la table', isPenible: false, bonusRatio: null },
  { name: 'Débarrasser la table', isPenible: true, bonusRatio: 5 },
  { name: 'Ranger sa chambre', isPenible: false, bonusRatio: null },
  { name: 'Sortir les poubelles', isPenible: true, bonusRatio: 5 },
];
