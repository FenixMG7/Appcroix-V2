// ---------------------------------------------------------------------------
// App Croix V2 — modèle de données
// ---------------------------------------------------------------------------

export type UserRole = 'parent' | 'child';

/** Document racine : families/{uid}. uid = Firebase Auth uid de la famille. */
export interface Family {
  email: string;
  pinHash: string;        // SHA-256 du code PIN parent (4 chiffres), '' avant le setup
  setupComplete: boolean;
}

/** Détail d'une semaine archivée, par membre. */
export interface WeeklyArchiveEntry {
  weekOf: string;                    // ex: "22 juin 2026"
  totalChores: number;               // total croix (bonus compris)
  bonusCroix: number;                // dont combien de croix bonus
  earnings: number;                  // gains € de cette semaine-là
  byCategory: Record<string, number>; // categoryId -> nb de croix cette semaine-là
}

/** families/{uid}/members/{memberId} */
export interface FamilyMember {
  id: string;
  name: string;
  avatarId: string;
  color: string;                     // couleur d'accent du profil (hex), choisie au setup
  role: UserRole;
  chores: Record<string, number>;    // croix de la semaine en cours, par catégorie
  bonusCroix: number;                // croix bonus de la semaine en cours
  totalEarnings: number;             // total € cumulé (toutes semaines archivées)
  archive: WeeklyArchiveEntry[];
}

/** families/{uid}/categories/{categoryId} */
export interface Category {
  id: string;
  name: string;
  isPenible: boolean;
  // Si isPenible: tous les N croix dans cette catégorie => +1 croix bonus.
  // Ex: bonusRatio = 5 pour "Débarrasser la table" => 1 croix bonus toutes les 5.
  bonusRatio: number | null;
}

// ---------------------------------------------------------------------------
// Types prévus pour la phase 2 (pas encore branchés à l'interface) :
// activités spéciales + notifications, jours d'exclusion, recommandation
// "à qui le tour ?". Les types existent déjà pour que le modèle de données
// n'ait pas besoin de migration quand on construira ces écrans.
// ---------------------------------------------------------------------------

/** families/{uid}/specialTasks/{taskId} */
export interface SpecialTask {
  id: string;
  name: string;
  description: string;
  bonusCroix: number;
  createdBy: string;       // memberId du parent
  acceptedBy: string | null; // memberId de l'enfant qui a accepté
  status: 'pending' | 'accepted' | 'completed';
  createdAt: string;       // ISO
}

/** families/{uid}/exclusions/{exclusionId} */
export interface ExclusionDay {
  id: string;
  memberId: string;
  date: string;             // YYYY-MM-DD
  reason: 'absent' | 'fatigue' | 'autre';
  note: string;
}

/** Résultat calculé (pas stocké) du système "à qui le tour ?". */
export interface ChoreRecommendation {
  categoryId: string;
  recommendedMemberId: string | null;
  reason: string;
}
