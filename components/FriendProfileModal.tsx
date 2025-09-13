import React, { useMemo } from 'react';
import { PlayerProfile, CompletedMatch } from '../types';
import { useI18n } from '../hooks/useI18n';
import { TelegramIcon } from './icons/TelegramIcon';

interface FriendProfileModalProps {
    friend: PlayerProfile;
    allMatches: CompletedMatch[];
    onClose: () => void;
}

const calculateAge = (birthDateString: string): number => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const EloEvolutionChart: React.FC<{ currentLevel: number, history: CompletedMatch[] }> = ({ currentLevel, history }) => {
    const { t } = useI18n();
    const eloPoints = useMemo(() => {
        const points = [currentLevel];
        let currentElo = currentLevel;
        // History is sorted newest to oldest, so we iterate backwards to get past ELO
        for (const match of history) {
            if (match.eloChange !== null) {
                currentElo -= match.eloChange;
                points.unshift(currentElo); // Add to the beginning
            }
        }
        return points;
    }, [currentLevel, history]);

    if (eloPoints.length < 2) {
        return <p className="text-center text-sm text-[var(--tg-theme-hint-color)]">{t('friendProfileModal.notEnoughData')}</p>;
    }

    const width = 300;
    const height = 80;
    const padding = 10;
    const minElo = Math.min(...eloPoints) - 0.1;
    const maxElo = Math.max(...eloPoints) + 0.1;
    const eloRange = maxElo - minElo;

    const pointsToPath = eloPoints.map((elo, i) => {
        const x = (i / (eloPoints.length - 1)) * (width - padding * 2) + padding;
        const y = height - (((elo - minElo) / eloRange) * (height - padding * 2) + padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
                <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--tg-theme-button-color)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--tg-theme-button-color)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline fill="none" stroke="var(--tg-theme-button-color)" strokeWidth="2" points={pointsToPath} />
            <polygon fill="url(#eloGradient)" points={`10,${height} ${pointsToPath} ${width - padding},${height}`} />
            <text x={padding} y={height - 2} fontSize="10" fill="var(--tg-theme-hint-color)">{minElo.toFixed(2)}</text>
            <text x={width - padding} y={height - 2} fontSize="10" fill="var(--tg-theme-hint-color)" textAnchor="end">{maxElo.toFixed(2)}</text>
        </svg>
    );
};

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({ friend, allMatches, onClose }) => {
    const { t, lang } = useI18n();

    const age = useMemo(() => calculateAge(friend.birthDate), [friend.birthDate]);

    const friendMatchHistory = useMemo(() => {
        return allMatches
            .filter(match => match.participants.some(p => p && p.telegram === friend.telegram) && match.result)
            .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
    }, [allMatches, friend.telegram]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-lg border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-0 flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                             <img src={friend.avatarUrl} alt={friend.name} className="w-16 h-16 rounded-full object-cover border-4 border-[var(--tg-theme-button-color)]/50" />
                            <div>
                                <h2 className="text-2xl font-bold">{friend.name}</h2>
                                <p className="text-md font-semibold text-[var(--tg-theme-button-color)]">{t('common.level')} {friend.level.toFixed(2)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                </div>

                <div className="p-6 pt-4 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-[var(--tg-theme-bg-color)] p-4 rounded-lg mb-6">
                         <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.ageLabel')}</p><p className="font-semibold">{t('profileModal.ageValue', { age: age })}</p></div>
                         <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.genderLabel')}</p><p className="font-semibold">{t(`gender.${friend.gender}`)}</p></div>
                         <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.handLabel')}</p><p className="font-semibold">{t(`handedness.${friend.handedness}`)}</p></div>
                         <div><p className="text-xs text-[var(--tg-theme-hint-color)]">{t('profileModal.sideLabel')}</p><p className="font-semibold">{t(`side.${friend.side}`)}</p></div>
                    </div>

                     <a
                        href={`https://t.me/${friend.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-opacity duration-300 hover:opacity-80 mb-6"
                    >
                        <TelegramIcon className="w-5 h-5" />
                        {t('friendProfileModal.contactOnTelegram')}
                    </a>
                    
                    <div className="mb-6">
                        <h3 className="font-bold text-lg mb-2">{t('friendProfileModal.eloEvolution')}</h3>
                        <div className="bg-[var(--tg-theme-bg-color)] p-4 rounded-lg">
                            <EloEvolutionChart currentLevel={friend.level} history={friendMatchHistory} />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2">{t('friendProfileModal.matchHistory')}</h3>
                        <div className="space-y-2">
                            {friendMatchHistory.length > 0 ? friendMatchHistory.map(match => (
                                <div key={match.id} className={`p-3 bg-[var(--tg-theme-bg-color)] rounded-lg flex justify-between items-center text-sm border-l-4 ${match.result === 'VICTORY' ? 'border-green-500' : 'border-red-500'}`}>
                                    <div>
                                        <p className="font-semibold">{new Date(match.matchDate).toLocaleDateString(lang, { day: '2-digit', month: 'short' })} - <span className={match.result === 'VICTORY' ? 'text-green-400' : 'text-red-400'}>{t(`matchResult.${match.result}`)}</span></p>
                                        <p className="text-xs text-[var(--tg-theme-hint-color)]">{match.score}</p>
                                    </div>
                                    <p className={`font-bold ${match.eloChange && match.eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {match.eloChange ? (match.eloChange > 0 ? `+${match.eloChange.toFixed(2)}` : match.eloChange.toFixed(2)) : '-'}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-4">{t('matchHistory.noMatchesTitle')}</p>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                     <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FriendProfileModal;