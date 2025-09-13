import React from 'react';
import { TournamentTeam, BracketMatch } from '../types';
import { useI18n } from '../hooks/useI18n';

interface TournamentBracketProps {
    teams: TournamentTeam[];
    bracket: BracketMatch[];
    isAdmin: boolean;
    isReadOnly: boolean;
    onRecordScore: (match: BracketMatch) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ teams, bracket, isAdmin, isReadOnly, onRecordScore }) => {
    const { t } = useI18n();
    const rounds = [...new Set(bracket.map(m => m.round))].sort((a, b) => a - b);
    const totalRounds = rounds.length > 0 ? Math.max(...rounds) : 0;

    const getTeam = (teamId?: number) => teams.find(t => t.id === teamId);

    const getRoundName = (round: number): string => {
        const roundsFromEnd = totalRounds - round;
        if (roundsFromEnd === 0 && totalRounds > 0) {
            return t('tournamentBracket.final');
        }
        if (roundsFromEnd === 1 && totalRounds > 1) {
            return t('tournamentBracket.semifinal');
        }
        if (roundsFromEnd === 2 && totalRounds > 2) {
            return t('tournamentBracket.quarterfinal');
        }
        return t('tournamentBracket.round', { round });
    };

    return (
        <div className="overflow-x-auto bg-[var(--tg-theme-bg-color)] rounded-lg">
            <div className="inline-block min-w-full p-4">
                {/* Headers aligned on one line */}
                <div className="flex space-x-4 mb-4">
                    {rounds.map(round => (
                        <div key={`title-${round}`} className="flex-shrink-0 w-44 text-center">
                            <h3 className="font-bold text-lg whitespace-nowrap">{getRoundName(round)}</h3>
                        </div>
                    ))}
                </div>
                {/* Matches with pyramid layout */}
                <div className="flex items-stretch space-x-4">
                    {rounds.map(round => (
                        <div key={round} className={`flex flex-col flex-shrink-0 w-44 ${round > 1 ? 'justify-around' : 'justify-start gap-4'}`}>
                            {bracket.filter(m => m.round === round).sort((a,b) => a.matchInRound - b.matchInRound).map(match => {
                                const team1 = getTeam(match.team1Id);
                                const team2 = getTeam(match.team2Id);
                                
                                const isClickable = isAdmin && !isReadOnly && team1 && team2 && !match.score;
                                const cursorClass = isClickable ? 'cursor-pointer hover:border-[var(--tg-theme-button-color)]' : '';

                                return (
                                    <div 
                                        key={match.id}
                                        onClick={() => isClickable && onRecordScore(match)}
                                        className={`bg-[var(--tg-theme-secondary-bg-color)] p-2 rounded-lg border border-transparent transition-colors ${cursorClass}`}
                                    >
                                        <div className="space-y-1 text-sm">
                                            <div className={`flex items-center p-1 rounded ${match.winnerTeamId === team1?.id ? 'font-extrabold text-white bg-green-600/50' : ''}`}>
                                                <span className="truncate">
                                                    {team1 ? `${team1.seed ? `[${team1.seed}] ` : ''}${team1.name}` : t('tournamentBracket.tbd')}
                                                </span>
                                            </div>
                                            <div className="border-b border-[var(--tg-theme-hint-color)]/20 mx-1"></div>
                                            <div className={`flex items-center p-1 rounded ${match.winnerTeamId === team2?.id ? 'font-extrabold text-white bg-green-600/50' : ''}`}>
                                                <span className="truncate">
                                                    {team1 && !team2 && <span className="text-[var(--tg-theme-hint-color)] italic">{t('tournamentBracket.bye')}</span>}
                                                    {team2 ? `${team2.seed ? `[${team2.seed}] ` : ''}${team2.name}` : (!team1 ? t('tournamentBracket.tbd') : '')}
                                                </span>
                                            </div>
                                            {match.score && <p className="text-xs text-center text-[var(--tg-theme-hint-color)] pt-1">{match.score}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TournamentBracket;