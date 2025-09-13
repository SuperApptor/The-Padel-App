import React from 'react';
import { CompletedMatch, Club } from '../types';
import CompletedMatchCard from './CompletedMatchCard';
import { useI18n } from '../hooks/useI18n';

interface MatchHistoryProps {
  matches: CompletedMatch[];
  isLoading: boolean;
  clubs: Club[];
  onRecordScore: (match: CompletedMatch) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] p-5 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg animate-pulse">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="h-5 bg-[var(--tg-theme-hint-color)]/30 rounded w-32"></div>
                <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-24"></div>
            </div>
            <div className="h-6 bg-[var(--tg-theme-hint-color)]/30 rounded-full w-20"></div>
        </div>
        <div className="mt-4 h-3 bg-[var(--tg-theme-hint-color)]/30 rounded w-40"></div>
        <div className="mt-5 h-10 bg-[var(--tg-theme-hint-color)]/30 rounded-md w-full"></div>
    </div>
);


const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, isLoading, clubs, onRecordScore }) => {
  const { t } = useI18n();
  return (
    <div>
      {isLoading && (
        <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
        </div>
      )}
      {!isLoading && matches.length === 0 && (
         <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
            <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('matchHistory.noMatchesTitle')}</h3>
            <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('matchHistory.noMatchesSubtitle')}</p>
        </div>
      )}
      {!isLoading && matches.length > 0 && (
         <div className="space-y-6">
            {matches.map((match) => (
              <CompletedMatchCard key={match.id} match={match} onRecordScore={() => onRecordScore(match)} clubs={clubs} />
            ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;