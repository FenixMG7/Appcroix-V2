import { Category, FamilyMember } from '../types';
import {
  REWARD_TIER_1_CHORES,
  REWARD_TIER_1_CASH,
  REWARD_TIER_1_CATEGORIES,
  REWARD_TIER_2_CHORES,
  REWARD_TIER_2_CASH,
  REWARD_TIER_2_CATEGORIES,
} from '../constants';

/**
 * Logique de calcul des gains hebdomadaires — reprise à l'identique de la V1
 * (App.tsx d'origine), seul ajout : les croix bonus comptent dans le total.
 */
export const calculateWeeklyEarnings = (chores: Record<string, number>, bonusCroix = 0): number => {
  const totalChores = Object.values(chores).reduce((sum: number, count: number) => sum + count, 0) + bonusCroix;
  const distinctCategories = Object.keys(chores).filter((catId) => chores[catId] > 0).length;

  if (totalChores >= REWARD_TIER_2_CHORES && distinctCategories >= REWARD_TIER_2_CATEGORIES) {
    return REWARD_TIER_2_CASH;
  }
  if (totalChores >= REWARD_TIER_1_CHORES && distinctCategories >= REWARD_TIER_1_CATEGORIES) {
    return REWARD_TIER_1_CASH;
  }
  return 0;
};

export const getTotalCroix = (chores: Record<string, number>, bonusCroix = 0): number =>
  Object.values(chores).reduce((sum: number, count: number) => sum + count, 0) + bonusCroix;

export interface ChoreDelta {
  chores: Record<string, number>;
  bonusCroix: number;
  bonusGained: boolean; // vrai si cette action vient de déclencher une croix bonus
}

/**
 * Ajoute une croix. Si la catégorie est pénible et que le compteur vient de
 * franchir un multiple de bonusRatio, une croix bonus est accordée en plus.
 * Ex: "Débarrasser la table" en pénible avec bonusRatio=5 => à la 5e, 10e,
 * 15e... croix, +1 croix bonus automatique.
 */
export const applyMarkChore = (member: FamilyMember, category: Category): ChoreDelta => {
  const oldCount = member.chores[category.id] || 0;
  const newCount = oldCount + 1;
  const crossesBonus = Boolean(
    category.isPenible && category.bonusRatio && category.bonusRatio > 0 && newCount % category.bonusRatio === 0
  );
  return {
    chores: { ...member.chores, [category.id]: newCount },
    bonusCroix: member.bonusCroix + (crossesBonus ? 1 : 0),
    bonusGained: crossesBonus,
  };
};

/** Symétrique de applyMarkChore : retire une croix, et la croix bonus associée si on repasse sous le seuil. */
export const applyUnmarkChore = (member: FamilyMember, category: Category): ChoreDelta => {
  const oldCount = member.chores[category.id] || 0;
  if (oldCount <= 0) {
    return { chores: member.chores, bonusCroix: member.bonusCroix, bonusGained: false };
  }
  const newCount = oldCount - 1;
  const losesBonus = Boolean(
    category.isPenible && category.bonusRatio && category.bonusRatio > 0 && oldCount % category.bonusRatio === 0
  );
  return {
    chores: { ...member.chores, [category.id]: newCount },
    bonusCroix: Math.max(0, member.bonusCroix - (losesBonus ? 1 : 0)),
    bonusGained: false,
  };
};
