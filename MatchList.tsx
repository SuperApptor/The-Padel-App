import React, { useState, useMemo } from 'react';
import { Match, PlayerProfile, Club, Tournament } from '../types';
import MatchCard from './MatchCard';
import { SearchIcon } from './icons/SearchIcon';
import { useI18n } from '../hooks/useI18n';

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  userProfile: PlayerProfile;
  clubs: Club[];
  tournaments: Tournament[];
  onInvite: (match: Match) => void;
  onAddFriend: (friendId: string) => void;
  onSelectClub: (club: Club) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] p-5 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg animate-pulse">
      <div className="space-y-2 mb-3">
            <div className="h-5 bg-[var(--tg-theme-hint-color)]/30 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-1/2 mx-auto"></div>
        </div>
      <div className="flex justify-center items-center gap-3 my-4">
        <div className="w-16 h-24 bg-[var(--tg-theme-hint-color)]/30 rounded-lg"></div>
        <div className="w-16 h-24 bg-[var(--tg-theme-hint-color)]/30 rounded-lg"></div>
        <div className="w-16 h-24 bg-[var(--tg-theme-hint-color)]/30 rounded-lg"></div>
        <div className="w-16 h-24 bg-[var(--tg-theme-hint-color)]/30 rounded-lg"></div>
      </div>
       <div className="mt-5 h-10 bg-[var(--tg-theme-hint-color)]/30 rounded-md w-full"></div>
    </div>
);


const MatchList: React.FC<MatchListProps> = ({ matches, isLoading, userProfile, clubs, onInvite, onAddFriend }) => {
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            const search = searchTerm.toLowerCase();
            const club = clubs.find(c => c.id === match.clubId);
            const levelMatch = !isNaN(parseFloat(search)) && parseFloat(search) >= match.levelMin && parseFloat(search) <= match.levelMax;
            return club?.name.toLowerCase().includes(search) || levelMatch;
        });
    }, [matches, searchTerm, clubs]);


  return (
    <div>
       <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/>
            </div>
            <input
            type="text"
            placeholder={t('matchList.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--tg-theme-secondary-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md py-2 pl-10 pr-4 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition"
            />
        </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
        </div>
      )}
      {!isLoading && filteredMatches.length === 0 && (
         <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
            <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('matchList.noMatchesTitle')}</h3>
            <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('matchList.noMatchesSubtitle')}</p>
        </div>
      )}
      {!isLoading && filteredMatches.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                userProfile={userProfile} 
                onInvite={onInvite} 
                onAddFriend={onAddFriend}
                circles={userProfile.circles}
                clubs={clubs}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;