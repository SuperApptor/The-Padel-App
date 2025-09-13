import React from 'react';
import { CompletedMatch, Club } from '../types';
import { useI18n } from '../hooks/useI18n';

interface CompletedMatchCardProps {
  match: CompletedMatch;
  clubs: Club[];
  onRecordScore: () => void;
}

const CompletedMatchCard: React.FC<CompletedMatchCardProps> = ({ match, clubs, onRecordScore }) => {
    const { t, lang } = useI18n();
    const isWin = match.result === 'VICTORY';
    const isCanceled = match.status === 'CANCELED';

    const getBorderColor = () => {
        if (isCanceled) return 'border-gray-500/30';
        if (match.result === 'VICTORY') return 'border-green-500/30';
        if (match.result === 'DEFEAT') return 'border-red-500/30';
        return 'border-[var(--tg-theme-hint-color)]/20';
    };

    const creator = match.participants[0];
    const club = clubs.find(c => c.id === match.clubId);

    const renderTeam = (player1: {name: string, level: number}, player2: {name: string, level: number}) => (
        <div className="flex-1 text-center bg-[var(--tg-theme-bg-color)]/60 p-2 rounded-md">
            <p className="font-semibold text-sm">{player1.name} <span className="text-[var(--tg-theme-hint-color)]">({player1.level.toFixed(1)})</span></p>
            <p className="font-semibold text-sm">{player2.name} <span className="text-[var(--tg-theme-hint-color)]">({player2.level.toFixed(1)})</span></p>
        </div>
    );

    return (
        <div className={`bg-[var(--tg-theme-secondary-bg-color)] p-5 rounded-xl border ${getBorderColor()} shadow-lg ${isCanceled ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)]">{club?.name || t('common.unknownClub')}</h3>
                    <p className="text-sm text-[var(--tg-theme-hint-color)]">{new Date(match.matchDate).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {isCanceled ? (
                    <div className="text-right text-gray-400">
                        <p className="text-lg font-bold">{t('matchCard.canceled')}</p>
                    </div>
                ) : match.result && match.eloChange !== null ? (
                    <div className={`text-right ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                       <p className="text-lg font-bold">{t(`matchResult.${match.result}`)}</p>
                       <p className="text-sm font-semibold">{match.eloChange > 0 ? `+${match.eloChange.toFixed(2)}` : match.eloChange.toFixed(2)} ELO</p>
                    </div>
                ) : null}
            </div>

            {match.score ? (
                <div className="mt-4">
                    <p className="text-center font-bold text-2xl my-2">{match.score}</p>
                    {match.partner && match.opponents && creator && (
                         <div className="flex items-center justify-center gap-2 text-[var(--tg-theme-text-color)]">
                            {renderTeam(creator, match.partner)}
                            <span className="font-bold text-[var(--tg-theme-hint-color)]">VS</span>
                            {renderTeam(match.opponents[0], match.opponents[1])}
                        </div>
                    )}
                </div>
            ) : (
                !isCanceled && match.participants.filter(p => p).length === 4 && (
                    <button
                        onClick={onRecordScore}
                        className="mt-4 w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
                    >
                        {t('completedMatchCard.recordScore')}
                    </button>
                )
            )}
        </div>
    );
};

export default CompletedMatchCard;