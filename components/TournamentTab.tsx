import React, { useState, useMemo } from 'react';
import { Tournament, Club, PlayerProfile, TournamentStatus } from '../types';
import TournamentList from './TournamentList';
import { useI18n } from '../hooks/useI18n';
import GuidanceBox from './GuidanceBox';

interface TournamentTabProps {
  tournaments: Tournament[];
  clubs: Club[];
  isLoading: boolean;
  userProfile: PlayerProfile;
  onSelectTournament: (tournament: Tournament) => void;
  onMarkSectionVisited: () => void;
}

const TournamentTab: React.FC<TournamentTabProps> = ({ tournaments, clubs, isLoading, userProfile, onSelectTournament, onMarkSectionVisited }) => {
    const { t } = useI18n();
    const [activeSubTab, setActiveSubTab] = useState<'current' | 'upcoming' | 'past'>('current');
    
    const filteredTournaments = useMemo(() => {
        const now = new Date();
        
        const getDisplayCategory = (t: Tournament): 'current' | 'upcoming' | 'past' => {
            const startDate = new Date(t.startDate);
            const endDate = new Date(t.endDate);
            endDate.setHours(23, 59, 59, 999);

            if (t.status === TournamentStatus.COMPLETED || t.status === TournamentStatus.CANCELED) return 'past';
            if (t.status === TournamentStatus.IN_PROGRESS) return 'current';
            
            // At this point, status is 'PLANNED'
            if (endDate < now) return 'past';
            if (startDate <= now && now <= endDate) return 'current';
            return 'upcoming';
        };

        const filtered = tournaments.filter(t => getDisplayCategory(t) === activeSubTab);
        
        if (activeSubTab === 'past') {
            return filtered.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
        }
        return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    }, [tournaments, activeSubTab]);
    
    return (
        <div className="space-y-6">
             {!userProfile.visitedSections?.tournaments && (
                <GuidanceBox
                    title={t('guidance.tournaments.title')}
                    text={t('guidance.tournaments.text')}
                    onDismiss={onMarkSectionVisited}
                />
            )}
            <div className="flex space-x-1 md:space-x-4 border-b border-[var(--tg-theme-hint-color)]/10">
                <button onClick={() => setActiveSubTab('current')} className={`py-2 px-2 md:px-4 text-sm md:text-base font-semibold transition-colors ${activeSubTab === 'current' ? 'text-[var(--tg-theme-text-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}>
                    {t('tournamentSubTabs.current')}
                </button>
                <button onClick={() => setActiveSubTab('upcoming')} className={`py-2 px-2 md:px-4 text-sm md:text-base font-semibold transition-colors ${activeSubTab === 'upcoming' ? 'text-[var(--tg-theme-text-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}>
                    {t('tournamentSubTabs.upcoming')}
                </button>
                <button onClick={() => setActiveSubTab('past')} className={`py-2 px-2 md:px-4 text-sm md:text-base font-semibold transition-colors ${activeSubTab === 'past' ? 'text-[var(--tg-theme-text-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}>
                    {t('tournamentSubTabs.past')}
                </button>
            </div>

            <TournamentList tournaments={filteredTournaments} clubs={clubs} isLoading={isLoading} userProfile={userProfile} onSelectTournament={onSelectTournament} />
        </div>
    );
};

export default TournamentTab;