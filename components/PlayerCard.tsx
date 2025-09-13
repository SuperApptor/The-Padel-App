
import React from 'react';
// Fix: Import Club type
import { Match, PlayerProfile, Club } from '../types';
import { CompetitiveIcon } from './icons/CompetitiveIcon';
import { PlusIcon } from './icons/PlusIcon';

interface MatchCardProps {
  match: Match;
  // Fix: Add clubs to resolve club name
  clubs: Club[];
}

const PlayerInfo: React.FC<{ player: PlayerProfile }> = ({ player }) => {
    const levelColor = "bg-yellow-300 text-black";

    return (
        <div className="flex flex-col items-center text-center space-y-1 w-16 flex-shrink-0">
            <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
            <p className="text-xs font-medium text-[var(--tg-theme-text-color)] truncate w-full">{player.name.split(' ')[0]}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColor}`}>
                {player.level.toFixed(2)}
            </span>
        </div>
    );
};

const EmptySlot: React.FC = () => (
    <div className="flex flex-col items-center text-center space-y-1 w-16 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-transparent border-2 border-dashed border-[var(--tg-theme-hint-color)] flex items-center justify-center">
            <PlusIcon className="w-6 h-6 text-[var(--tg-theme-hint-color)]" />
        </div>
        <p className="text-xs font-medium text-[var(--tg-theme-hint-color)]">Libre</p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full opacity-0">0.00</span>
    </div>
);

const MatchCard: React.FC<MatchCardProps> = ({ match, clubs }) => {
  const openSlots = 4 - match.participants.length;
  // Fix: Find the club object from the clubs array using clubId
  const club = clubs.find(c => c.id === match.clubId);

  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] p-4 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-[var(--tg-theme-button-color)]/50 hover:shadow-lg hover:shadow-[var(--tg-theme-button-color)]/10">
      <div>
        {/* Date and Time */}
        <p className="font-semibold text-center text-md text-[var(--tg-theme-text-color)] mb-2">
            {new Date(match.matchDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            <span className="text-[var(--tg-theme-hint-color)]"> | </span>
            {match.matchTime}
        </p>

        {/* Type and Level */}
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--tg-theme-hint-color)] mb-4">
            <CompetitiveIcon className="w-4 h-4" />
            <span className="font-medium">Compétitif</span>
            <span className="font-bold text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-hint-color)]/20 px-2 py-0.5 rounded">
                {match.levelMin.toFixed(1)} - {match.levelMax.toFixed(1)}
            </span>
        </div>
        
        {/* Players */}
        <div className="flex justify-center items-start gap-3 my-4">
            {match.participants.map(player => (
                <PlayerInfo key={player.telegram} player={player} />
            ))}
            {Array.from({ length: openSlots }).map((_, i) => (
                <EmptySlot key={`empty-${i}`} />
            ))}
        </div>

        {/* Club Info */}
        <div className="text-center border-t border-[var(--tg-theme-hint-color)]/20 pt-3 mt-3">
             {/* Fix: Display club name instead of non-existent city property */}
             <p className="font-bold text-[var(--tg-theme-text-color)]">{club?.name || 'Club inconnu'}</p>
        </div>
      </div>

      <a
        href={`https://t.me/${match.participants[0].telegram}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
      >
        Rejoindre le match
      </a>
    </div>
  );
};

export default MatchCard;