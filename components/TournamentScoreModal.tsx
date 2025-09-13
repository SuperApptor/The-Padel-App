
import React, { useState, useMemo } from 'react';
import { Tournament, TournamentCategory, BracketMatch, TournamentTeam, MatchFormatConfiguration, SetType, FinalSetType } from '../types';
import { useI18n } from '../hooks/useI18n';
import { getMatchFormatForRound } from '../utils/tournamentUtils';

interface TournamentScoreModalProps {
  tournament: Tournament;
  category: TournamentCategory;
  match: BracketMatch;
  onClose: () => void;
  onSave: (tournamentId: number, categoryId: number, matchId: number, score: string) => void;
}

const TournamentScoreModal: React.FC<TournamentScoreModalProps> = ({ tournament, category, match, onClose, onSave }) => {
  const { t } = useI18n();
  const [sets, setSets] = useState(
    Array.from({ length: 5 }, () => ({ team1: '', team2: '' }))
  );
  const [error, setError] = useState<string | null>(null);

  const team1 = category.teams?.find(t => t.id === match.team1Id);
  const team2 = category.teams?.find(t => t.id === match.team2Id);
  
  const matchFormat = useMemo(() => getMatchFormatForRound(category, match), [category, match]);

  if (!team1 || !team2 || !matchFormat) {
      return null;
  }

  const handleSetChange = (setIndex: number, team: 'team1' | 'team2', value: string) => {
    if (!/^\d*$/.test(value) || Number(value) > 20) return;
    const newSets = [...sets];
    newSets[setIndex][team] = value;
    setSets(newSets);
  };
  
  const isValidSet = (s1: number, s2: number, setType: SetType): string | true => {
    if (s1 === s2) return "A set cannot end in a tie.";
    const winnerScore = Math.max(s1, s2);
    const loserScore = Math.min(s1, s2);

    switch (setType) {
        case SetType.CLASSIC_6_GAMES_TB:
            if ((winnerScore === 6 && loserScore <= 4) || (winnerScore === 7 && (loserScore === 5 || loserScore === 6))) return true;
            return t('recordScoreModal.errors.classic6GamesTB');
        case SetType.SHORT_4_GAMES_TB:
            if ((winnerScore === 4 && loserScore <= 2) || (winnerScore === 5 && loserScore === 4) || (winnerScore === 4 && loserScore === 3)) return true; // Assuming 4-3 is valid without tiebreak info
            return t('recordScoreModal.errors.short4GamesTB');
        case SetType.SHORT_4_GAMES_NO_TB:
            if (winnerScore === 4 && loserScore < 4) return true;
            return t('recordScoreModal.errors.short4GamesNoTB');
        case SetType.PRO_SET_9_GAMES:
             if ((winnerScore === 9 && loserScore <= 7) || (winnerScore > 9 && winnerScore - loserScore === 2) || (winnerScore === 10 && loserScore === 9)) return true;
             return t('recordScoreModal.errors.proSet9Games');
    }
    return true;
  };
  
  const isValidFinalSet = (s1: number, s2: number, finalSetType: FinalSetType): string | true => {
      if (s1 === s2) return "A set cannot end in a tie.";
      const winnerScore = Math.max(s1, s2);
      const loserScore = Math.min(s1, s2);
      switch(finalSetType) {
          case FinalSetType.SUPER_TIEBREAK_10_POINTS:
              if (winnerScore >= 10 && winnerScore - loserScore >= 2) return true;
              return t('recordScoreModal.errors.superTiebreak10Points');
          case FinalSetType.SHORT_4_GAMES_2_GAMES_DIFF:
              if (winnerScore >= 4 && winnerScore - loserScore >= 2) return true;
              return t('recordScoreModal.errors.short4Games2GamesDiff');
          default:
              return isValidSet(s1, s2, finalSetType as unknown as SetType);
      }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const completedSets = sets.filter(s => s.team1 !== '' && s.team2 !== '');
    if (matchFormat.setsToWin === 1 && completedSets.length > 1) {
        setError(t('recordScoreModal.errors.multipleWinners'));
        return;
    }
    if (completedSets.length === 0) {
        setError(t('recordScoreModal.errors.atLeastOneSet'));
        return;
    }

    let team1Wins = 0;
    let team2Wins = 0;

    for (let i = 0; i < completedSets.length; i++) {
        const set = completedSets[i];
         if (set.team1 === '' || set.team2 === '') {
            setError(t('recordScoreModal.errors.incompleteSet'));
            return;
        }
        const team1Score = parseInt(set.team1, 10);
        const team2Score = parseInt(set.team2, 10);

        if (isNaN(team1Score) || isNaN(team2Score)) {
            setError(t('recordScoreModal.errors.invalidScore'));
            return;
        }

        let validationResult: string | true;
        const isDecidingSet = team1Wins + 1 === matchFormat.setsToWin && team2Wins + 1 === matchFormat.setsToWin;

        if (isDecidingSet) {
            validationResult = isValidFinalSet(team1Score, team2Score, matchFormat.finalSetType);
        } else {
            validationResult = isValidSet(team1Score, team2Score, matchFormat.regularSetType);
        }
        
        if (typeof validationResult === 'string') {
            setError(validationResult.replace('{{set}}', (i + 1).toString()));
            return;
        }

        if (team1Score > team2Score) team1Wins++;
        else team2Wins++;

        if (team1Wins === matchFormat.setsToWin || team2Wins === matchFormat.setsToWin) {
            if (i < completedSets.length - 1) {
                setError(t('recordScoreModal.errors.unnecessarySet'));
                return;
            }
            break;
        }
    }
    
    if (team1Wins < matchFormat.setsToWin && team2Wins < matchFormat.setsToWin) {
        if(team1Wins + team2Wins === (matchFormat.setsToWin * 2 - 2)) {
            setError(t('recordScoreModal.errors.decidingSetNeeded'));
        } else {
            setError(t('recordScoreModal.errors.noWinner'));
        }
        return;
    }

    const scoreString = completedSets.map(s => `${s.team1}-${s.team2}`).join(' / ');
    onSave(tournament.id, category.id, match.id, scoreString);
  };
  
  const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";

  const TeamDisplay: React.FC<{ team: TournamentTeam }> = ({ team }) => (
     <div className="bg-[var(--tg-theme-bg-color)] p-2 rounded-lg text-center">
        <p className="font-semibold text-sm">{team.name}</p>
        <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {team.level.toFixed(2)}</p>
     </div>
  );

  const setsToDisplay = useMemo(() => {
    if (matchFormat.setsToWin === 1) return 1;

    const completedSets = sets.filter(s => s.team1 !== '' && s.team2 !== '');
    if (completedSets.length < (matchFormat.setsToWin * 2 - 2)) {
      return matchFormat.setsToWin * 2 - 2;
    }

    let team1Wins = 0;
    let team2Wins = 0;
    completedSets.slice(0, matchFormat.setsToWin * 2 - 2).forEach(set => {
        const s1 = parseInt(set.team1, 10);
        const s2 = parseInt(set.team2, 10);
        if(isNaN(s1) || isNaN(s2)) return;
        if(s1 > s2) team1Wins++; else team2Wins++;
    });

    if (team1Wins === team2Wins && team1Wins > 0) return matchFormat.setsToWin * 2 - 1;
    return matchFormat.setsToWin * 2 - 2;

  }, [sets, matchFormat]);


  const renderScoreInputs = () => {
    return Array.from({ length: setsToDisplay }).map((_, index) => {
        let label = `Set ${index + 1}`;
        const isDecidingSet = index + 1 === matchFormat.setsToWin * 2 - 1;

        if (isDecidingSet) {
             label = t(`finalSetType.${matchFormat.finalSetType}`);
        } else {
            label = t(`setType.${matchFormat.regularSetType}`).replace(' (TB at 6-6)', '').replace(' (TB at 4-4)','');
        }

        return (
             <div key={index} className="flex items-center gap-2">
                <span className="w-40 text-xs text-[var(--tg-theme-hint-color)]">{`${label} (Set ${index + 1})`}</span>
                <input type="tel" value={sets[index].team1} onChange={e => handleSetChange(index, 'team1', e.target.value)} className={`${inputClass} text-center`} />
                <span className="font-bold text-[var(--tg-theme-hint-color)]">-</span>
                <input type="tel" value={sets[index].team2} onChange={e => handleSetChange(index, 'team2', e.target.value)} className={`${inputClass} text-center`} />
            </div>
        )
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('tournamentScoreModal.title')}</h2>
            <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
        </div>
        <p className="text-sm text-[var(--tg-theme-hint-color)]">{t('tournamentScoreModal.recordScoreFor')}</p>
        <p className="text-sm font-semibold text-[var(--tg-theme-button-color)] mb-4">{t(`setsToWin.${matchFormat.setsToWin}`)}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="flex-1"><TeamDisplay team={team1} /></div>
                <span className="font-bold">VS</span>
                 <div className="flex-1"><TeamDisplay team={team2} /></div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">{t('recordScoreModal.finalScore')}</label>
              <div className="space-y-2">
                {renderScoreInputs()}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 text-[var(--tg-theme-text-color)] font-bold py-2.5 px-4 rounded-md transition-opacity hover:opacity-80">
                    {t('common.cancel')}
                </button>
                 <button type="submit" className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md transition-opacity hover:opacity-80">
                    {t('common.submitResult')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentScoreModal;
