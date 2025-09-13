
import React, { useState } from 'react';
import { PlayerProfile, PlayerCircle } from '../types';
import { CalendarPlusIcon } from './icons/UserPlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DEMO_CLUBS } from '../constants';

interface MatchFormProps {
  profile: PlayerProfile;
  circles: PlayerCircle[];
  addMatch: (
    city: string, 
    levelMin: number,
    levelMax: number,
    matchDate: string,
    matchTime: string,
    playersNeeded: number,
    circleId?: number
  ) => Promise<string | null>;
}

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h < 23; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = String(h).padStart(2, '0');
            const minute = String(m).padStart(2, '0');
            slots.push(`${hour}:${minute}`);
        }
    }
    return slots;
};
const timeSlots = generateTimeSlots();

const MatchForm: React.FC<MatchFormProps> = ({ addMatch, profile, circles }) => {
  const [matchDetails, setMatchDetails] = useState({
    levelMin: (profile.level - 0.5).toFixed(1),
    levelMax: (profile.level + 0.5).toFixed(1),
    city: '',
    date: getTodayString(),
    time: '19:00',
    playersNeeded: 1,
  });
  const [selectedCircleId, setSelectedCircleId] = useState<string>('public');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleMatchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setMatchDetails({ ...matchDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchDetails.city || !matchDetails.date || !matchDetails.time) {
        setError("Veuillez sélectionner un club, une date et une heure.");
        return;
    };

    const selectedDateTime = new Date(`${matchDetails.date}T${matchDetails.time}`);
    if (selectedDateTime < new Date()) {
        setError("Vous ne pouvez pas proposer un match dans le passé.");
        return;
    }

    if (parseFloat(matchDetails.levelMin) >= parseFloat(matchDetails.levelMax)) {
      setError("Le niveau minimum doit être inférieur au niveau maximum.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const apiError = await addMatch(
        matchDetails.city, 
        Number(matchDetails.levelMin),
        Number(matchDetails.levelMax), 
        matchDetails.date, 
        matchDetails.time, 
        Number(matchDetails.playersNeeded),
        selectedCircleId === 'public' ? undefined : Number(selectedCircleId)
    );
    setIsLoading(false);
    if(apiError) {
      setError(apiError);
    } else {
      setMatchDetails(prevDetails => ({
        ...prevDetails,
        city: '',
        date: getTodayString(),
        time: '19:00',
        playersNeeded: 1,
      }));
      setSelectedCircleId('public');
    }
  };
  
  const selectStyle = { 
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
      backgroundPosition: 'right 0.5rem center', 
      backgroundRepeat: 'no-repeat', 
      backgroundSize: '1.5em 1.5em' 
  };
  
  const selectClassName = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition appearance-none";

  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] p-6 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg sticky top-36">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-[var(--tg-theme-text-color)]">
        <CalendarPlusIcon className="w-7 h-7 text-[var(--tg-theme-button-color)]" />
        Proposer un match
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--tg-theme-bg-color)]/50 p-3 rounded-lg border border-[var(--tg-theme-hint-color)]/10 flex items-center space-x-3">
             <img src={profile.avatarUrl} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
             <div>
                 <p className="font-bold text-[var(--tg-theme-text-color)]">{profile.name}</p>
                 <p className="text-sm text-[var(--tg-theme-hint-color)]">{profile.handedness} / Joueur de {profile.side}</p>
             </div>
        </div>

        <fieldset className="space-y-4 border-t border-[var(--tg-theme-hint-color)]/20 pt-4">
            <legend className="text-lg font-semibold -mt-8 bg-[var(--tg-theme-secondary-bg-color)] px-2">Détails du Match</legend>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Club / Ville</label>
              <select id="city" name="city" value={matchDetails.city} onChange={handleMatchChange} className={selectClassName} style={selectStyle} disabled={isLoading}>
                <option value="" disabled>Sélectionner un club</option>
                {DEMO_CLUBS.map(club => <option key={club} value={club}>{club}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Date</label>
                    <input type="date" name="date" value={matchDetails.date} onChange={handleMatchChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" disabled={isLoading} />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Heure</label>
                    <select id="time" name="time" value={matchDetails.time} onChange={handleMatchChange} className={selectClassName} style={selectStyle} disabled={isLoading}>
                      {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Niveau recherché</label>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="0.1" name="levelMin" value={matchDetails.levelMin} onChange={handleMatchChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" placeholder="Min" disabled={isLoading} />
                    <input type="number" step="0.1" name="levelMax" value={matchDetails.levelMax} onChange={handleMatchChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" placeholder="Max" disabled={isLoading} />
                </div>
            </div>
            <div>
              <label htmlFor="playersNeeded" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Joueurs recherchés</label>
              <select name="playersNeeded" value={matchDetails.playersNeeded} onChange={handleMatchChange} className={selectClassName} style={selectStyle} disabled={isLoading}>
                <option value={1}>1 joueur</option>
                <option value={2}>2 joueurs</option>
                <option value={3}>3 joueurs</option>
              </select>
            </div>
        </fieldset>
        
        <fieldset className="space-y-3 border-t border-[var(--tg-theme-hint-color)]/20 pt-4">
          <legend className="text-lg font-semibold -mt-8 bg-[var(--tg-theme-secondary-bg-color)] px-2">Visibilité</legend>
            <select name="circleId" value={selectedCircleId} onChange={(e) => setSelectedCircleId(e.target.value)} className={selectClassName} style={selectStyle} disabled={isLoading}>
              <option value="public">Public (ouvert à tous)</option>
              {circles.map(circle => (
                <option key={circle.id} value={circle.id}>Cercle : {circle.name}</option>
              ))}
            </select>
        </fieldset>

        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        <button type="submit" disabled={isLoading} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-3 px-4 rounded-md flex items-center justify-center transition-opacity duration-300 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
          {isLoading ? (
            <>
              <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Création de l'annonce...
            </>
          ) : "Créer le match & Générer l'annonce"}
        </button>
      </form>
    </div>
  );
};

export default MatchForm;