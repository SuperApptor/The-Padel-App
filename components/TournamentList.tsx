import React from 'react';
import { Tournament, Club, PlayerProfile } from '../types';
import TournamentCard from './TournamentCard';
import { useI18n } from '../hooks/useI18n';

interface TournamentListProps {
  tournaments: Tournament[];
  clubs: Club[];
  isLoading: boolean;
  userProfile: PlayerProfile;
  onSelectTournament: (tournament: Tournament) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg overflow-hidden animate-pulse">
        <div className="w-full h-40 bg-[var(--tg-theme-hint-color)]/30"></div>
        <div className="p-4">
            <div className="h-6 bg-[var(--tg-theme-hint-color)]/30 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-1/4"></div>
                <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-1/3"></div>
            </div>
            <div className="mt-4 h-10 bg-[var(--tg-theme-hint-color)]/30 rounded-md w-full"></div>
        </div>
    </div>
);

const TournamentList: React.FC<TournamentListProps> = ({ tournaments, clubs, isLoading, userProfile, onSelectTournament }) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
        </div>
    );
  }

  if (tournaments.length === 0) {
    return (
        <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
            <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('tournamentTab.noTournamentsTitle')}</h3>
            <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('tournamentTab.noTournamentsSubtitle')}</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} clubs={clubs} userProfile={userProfile} onSelectTournament={onSelectTournament} />
      ))}
    </div>
  );
};

export default TournamentList;