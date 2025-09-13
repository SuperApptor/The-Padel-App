import React, { useState, useMemo } from 'react';
import { CompletedMatch, PlayerProfile, Club, SetType, FinalSetType } from '../types';
import { useI18n } from '../hooks/useI18n';
import { DEFAULT_MATCH_FORMAT } from '../constants';

interface RecordScoreModalProps {
  match: CompletedMatch;
  userProfile: PlayerProfile;
  onClose: () => void;
  onSave: (matchId: number, score: string) => void;
  clubs: Club[];
}

const RecordScoreModal: React.FC<RecordScoreModalProps> = ({ match, userProfile, onClose, onSave, clubs }) => {
  const { t, lang } = useI18n();
  const [sets, setSets] = useState([
    { yourTeam: '', opponents: '' },
    { yourTeam: '', opponents: '' },
    { yourTeam: '', opponents: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const club = clubs.find(c => c.id === match.clubId);
  const matchFormat = match.format || DEFAULT_MATCH_FORMAT;

  const { yourTeam, opponentTeam } = useMemo(() => {
    const userIndex = match.participants.findIndex(p => p?.telegram === userProfile.telegram);
    if (userIndex === -1) return { yourTeam: [], opponentTeam: [] };

    let yourTeamIndices: number[], opponentTeamIndices: number[];

    if (userIndex === 0 || userIndex === 1) { // User is in Team 1
        yourTeamIndices = [0, 1];
        opponentTeamIndices = [2, 3];
    } else { // User is in Team 2
        yourTeamIndices = [2, 3];
        opponentTeamIndices = [0, 1];
    }
    
    const yourTeam = yourTeamIndices.map(i => match.participants[i]).filter((p): p is PlayerProfile => !!p);
    const opponentTeam = opponentTeamIndices.map(i => match.participants[i]).filter((p): p is PlayerProfile => !!p);

    return { yourTeam, opponentTeam };
  }, [match.participants, userProfile.telegram]);


  const handleSetChange = (setIndex: number, team: 'yourTeam' | 'opponents', value: string) => {
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

    const completedSets = sets.filter(s => s.yourTeam !== '' && s.opponents !== '');
    if (matchFormat.setsToWin === 1 && completedSets.length > 1) {
        setError(t('recordScoreModal.errors.multipleWinners'));
        return;
    }
    if (completedSets.length === 0) {
        setError(t('recordScoreModal.errors.atLeastOneSet'));
        return;
    }

    let yourWins = 0;
    let opponentWins = 0;

    for (let i = 0; i < completedSets.length; i++) {
        const set = completedSets[i];
        if (set.yourTeam === '' || set.opponents === '') {
            setError(t('recordScoreModal.errors.incompleteSet'));
            return;
        }
        const yourScore = parseInt(set.yourTeam, 10);
        const opponentScore = parseInt(set.opponents, 10);

        if (isNaN(yourScore) || isNaN(opponentScore)) {
            setError(t('recordScoreModal.errors.invalidScore'));
            return;
        }

        let validationResult: string | true;
        if (matchFormat.setsToWin > 1 && yourWins === 1 && opponentWins === 1) {
            validationResult = isValidFinalSet(yourScore, opponentScore, matchFormat.finalSetType);
        } else {
            validationResult = isValidSet(yourScore, opponentScore, matchFormat.regularSetType);
        }

        if (typeof validationResult === 'string') {
            setError(validationResult.replace('{{set}}', (i + 1).toString()));
            return;
        }

        if (yourScore > opponentScore) yourWins++;
        else opponentWins++;

        if (yourWins === matchFormat.setsToWin || opponentWins === matchFormat.setsToWin) {
            if (i < completedSets.length - 1) {
                setError(t('recordScoreModal.errors.unnecessarySet'));
                return;
            }
            break;
        }
    }
    
    if (yourWins < matchFormat.setsToWin && opponentWins < matchFormat.setsToWin) {
        if(yourWins + opponentWins === (matchFormat.setsToWin * 2 - 2)) {
            setError(t('recordScoreModal.errors.decidingSetNeeded'));
        } else {
            setError(t('recordScoreModal.errors.noWinner'));
        }
        return;
    }
    
    const scoreString = completedSets.map(s => `${s.yourTeam}-${s.opponents}`).join(' / ');
    onSave(match.id, scoreString);
  };
  
  const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";

  const TeamDisplay: React.FC<{ team: PlayerProfile[] }> = ({ team }) => (
    <div className="grid grid-cols-2 gap-2">
      {team.map(player => (
         <div key={player.telegram} className="flex items-center gap-2 bg-[var(--tg-theme-bg-color)] p-2 rounded-lg">
            <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-sm">{player.name}</p>
              <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
            </div>
         </div>
      ))}
    </div>
  );
  
  const setsToDisplay = useMemo(() => {
    if (matchFormat.setsToWin === 1) return 1;

    const completedSets = sets.filter(s => s.yourTeam !== '' && s.opponents !== '');
    if (completedSets.length < 2) return 2;
    
    let yourWins = 0;
    let opponentWins = 0;
    completedSets.slice(0, 2).forEach(set => {
        const yourScore = parseInt(set.yourTeam, 10);
        const opponentScore = parseInt(set.opponents, 10);
        if(isNaN(yourScore) || isNaN(opponentScore)) return;
        if(yourScore > opponentScore) yourWins++; else opponentWins++;
    });

    if (yourWins === 1 && opponentWins === 1) return 3;
    return 2;

  }, [sets, matchFormat]);


  const renderScoreInputs = () => {
    return Array.from({ length: setsToDisplay }).map((_, index) => {
        let label = `${t('recordScoreModal.setLabel', {number: index + 1})}`;
        const isDecidingSet = index === matchFormat.setsToWin * 2 - 2;

        if (isDecidingSet && matchFormat.finalSetType === FinalSetType.SUPER_TIEBREAK_10_POINTS) {
            label = t('recordScoreModal.superTiebreakLabel');
        }

        return (
             <div key={index} className="flex items-center gap-2">
                <span className="w-24 text-sm text-[var(--tg-theme-hint-color)]">{label}</span>
                <input type="tel" value={sets[index].yourTeam} onChange={e => handleSetChange(index, 'yourTeam', e.target.value)} className={`${inputClass} text-center`} />
                <span className="font-bold text-[var(--tg-theme-hint-color)]">-</span>
                <input type="tel" value={sets[index].opponents} onChange={e => handleSetChange(index, 'opponents', e.target.value)} className={`${inputClass} text-center`} />
            </div>
        )
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('recordScoreModal.title')}</h2>
            <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
        </div>
        <p className="text-sm text-[var(--tg-theme-hint-color)] mb-1">{t('recordScoreModal.subtitle', { clubName: club?.name || t('common.unknownClub'), date: new Date(match.matchDate).toLocaleDateString(lang) })}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
                <div>
                    <p className="font-semibold text-sm mb-1">{t('recordScoreModal.yourTeam')}:</p>
                    <TeamDisplay team={yourTeam} />
                </div>
                 <div>
                    <p className="font-semibold text-sm mb-1">{t('recordScoreModal.opponents')}:</p>
                    <TeamDisplay team={opponentTeam} />
                </div>
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

export default RecordScoreModal;