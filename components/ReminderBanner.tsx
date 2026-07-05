import React from 'react';
import { FamilyMember } from '../types';
import { REWARD_TIER_1_CHORES, REWARD_TIER_2_CHORES } from '../constants';
import { getTotalCroix } from '../utils/rewards';

interface ReminderBannerProps {
  members: FamilyMember[];
}

const ReminderBanner: React.FC<ReminderBannerProps> = ({ members }) => {
  const today = new Date().getDay(); // Dimanche=0, ... Samedi=6
  if (![0, 5, 6].includes(today)) {
    return null;
  }

  const children = members.filter((m) => m.role === 'child');

  const reminders = children
    .map((child) => {
      const total = getTotalCroix(child.chores, child.bonusCroix);
      if (total < REWARD_TIER_1_CHORES) {
        const remaining = REWARD_TIER_1_CHORES - total;
        return `${child.name}, plus que ${remaining} tâche${remaining > 1 ? 's' : ''} pour ton premier objectif ! 💪`;
      }
      if (total < REWARD_TIER_2_CHORES) {
        const remaining = REWARD_TIER_2_CHORES - total;
        return `${child.name}, encore ${remaining} tâche${remaining > 1 ? 's' : ''} pour atteindre le grand objectif ! 🚀`;
      }
      return null;
    })
    .filter((msg): msg is string => Boolean(msg));

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded-r-lg shadow">
      <p className="font-bold">Rappel de fin de semaine !</p>
      <ul className="list-disc list-inside mt-2">
        {reminders.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReminderBanner;
