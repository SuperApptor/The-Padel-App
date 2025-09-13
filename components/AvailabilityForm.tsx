
import React, { useState } from 'react';
import { PlayerProfile, PlayerAvailability, AvailabilityType } from '../types';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
// Fix: Import INITIAL_CLUBS to map club names to IDs
import { DEMO_CLUBS, DAYS_OF_WEEK, AVAILABILITY_TYPES, INITIAL_CLUBS } from '../constants';

interface AvailabilityFormProps {
  profile: PlayerProfile;
  addAvailability: (availability: Omit<PlayerAvailability, 'id' | 'player'>) => boolean;
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
        for (let m = 0; m < 60; m += 30) {
            const hour = String(h).padStart(2, '0');
            const minute = String(m).padStart(2, '0');
            slots.push(`${hour}:${minute}`);
        }
    }
    return slots;
};
const timeSlots = generateTimeSlots();


const AvailabilityForm: React.FC<AvailabilityFormProps> = ({ addAvailability, profile }) => {
    const [type, setType] = useState<AvailabilityType>(AvailabilityType.ONE_TIME);
    const [formData, setFormData] = useState({
        levelMin: (profile.level - 1).toFixed(1),
        levelMax: (profile.level + 1).toFixed(1),
        startTime: '18:00',
        endTime: '21:00',
        date: getTodayString(),
        startDate: getTodayString(),
        endDate: getTodayString(),
    });
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDayToggle = (day: string) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleClubToggle = (club: string) => {
        setSelectedClubs(prev =>
            prev.includes(club) ? prev.filter(c => c !== club) : [...prev, club]
        );
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if ((type === AvailabilityType.RECURRING || type === AvailabilityType.DATE_RANGE) && selectedDays.length === 0) {
            setError("Veuillez sélectionner au moins un jour.");
            return;
        }
        if (selectedClubs.length === 0) {
            setError("Veuillez sélectionner au moins un club.");
            return;
        }
        if (parseFloat(formData.levelMin) >= parseFloat(formData.levelMax)) {
            setError("Le niveau minimum doit être inférieur au niveau maximum.");
            return;
        }
        if (formData.startTime >= formData.endTime) {
            setError("L'heure de début doit être avant l'heure de fin.");
            return;
        }
        if (type === AvailabilityType.DATE_RANGE && formData.startDate >= formData.endDate) {
            setError("La date de début doit être avant la date de fin.");
            return;
        }

        setIsLoading(true);

        // Fix: Convert selected club names (string[]) to club IDs (number[])
        const clubIds = selectedClubs.map(clubName => {
            const club = INITIAL_CLUBS.find(c => c.name === clubName);
            return club?.id;
        }).filter((id): id is number => id !== undefined);

        const availabilityData: Omit<PlayerAvailability, 'id' | 'player'> = {
            type,
            days: selectedDays,
            startTime: formData.startTime,
            endTime: formData.endTime,
            // Fix: Use 'clubIds' property with an array of numbers
            clubIds: clubIds,
            levelMin: Number(formData.levelMin),
            levelMax: Number(formData.levelMax),
            ...(type === AvailabilityType.ONE_TIME && { date: formData.date, days: [] }),
            ...(type === AvailabilityType.DATE_RANGE && { startDate: formData.startDate, endDate: formData.endDate }),
        };

        const success = addAvailability(availabilityData);

        setIsLoading(false);
        if (success) {
            setFormData({
                levelMin: (profile.level - 1).toFixed(1),
                levelMax: (profile.level + 1).toFixed(1),
                startTime: '18:00',
                endTime: '21:00',
                date: getTodayString(),
                startDate: getTodayString(),
                endDate: getTodayString(),
            });
            setSelectedDays([]);
            setSelectedClubs([]);
        } else {
            setError("Une erreur est survenue. Veuillez réessayer.");
        }
    };
    
    const selectStyle = { 
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
    };

    return (
        <div className="bg-[var(--tg-theme-secondary-bg-color)] p-6 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg sticky top-36">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-[var(--tg-theme-text-color)]">
                <CalendarDaysIcon className="w-7 h-7 text-[var(--tg-theme-button-color)]" />
                Publier ma disponibilité
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">Type de disponibilité</label>
                    <div className="grid grid-cols-3 gap-1 bg-[var(--tg-theme-bg-color)] p-1 rounded-lg">
                        {AVAILABILITY_TYPES.map(availType => (
                            <button type="button" key={availType} onClick={() => setType(availType)} className={`p-2 rounded-md text-xs font-semibold text-center transition ${type === availType ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' : 'text-[var(--tg-theme-text-color)]'}`}>
                                {availType}
                            </button>
                        ))}
                    </div>
                </div>

                {type === AvailabilityType.ONE_TIME && (
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" />
                    </div>
                )}

                {(type === AvailabilityType.RECURRING || type === AvailabilityType.DATE_RANGE) && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">Jours de la semaine</label>
                        <div className="grid grid-cols-4 gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`p-2 rounded-md text-xs font-semibold text-center transition ${selectedDays.includes(day) ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' : 'bg-[var(--tg-theme-bg-color)]'}`}>
                                    {day.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {type === AvailabilityType.DATE_RANGE && (
                     <div>
                        <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Période</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" />
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Créneau horaire</label>
                    <div className="grid grid-cols-2 gap-4">
                        <select name="startTime" value={formData.startTime} onChange={handleChange} style={selectStyle} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition appearance-none">
                            {timeSlots.map(slot => <option key={`start-${slot}`} value={slot}>{slot}</option>)}
                        </select>
                         <select name="endTime" value={formData.endTime} onChange={handleChange} style={selectStyle} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition appearance-none">
                            {timeSlots.map(slot => <option key={`end-${slot}`} value={slot}>{slot}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-2">Clubs favoris</label>
                    <div className="space-y-2">
                        {DEMO_CLUBS.map(club => (
                            <label key={club} className="flex items-center space-x-3 p-2 bg-[var(--tg-theme-bg-color)] rounded-md cursor-pointer">
                                <input type="checkbox" checked={selectedClubs.includes(club)} onChange={() => handleClubToggle(club)} className="h-4 w-4 rounded bg-transparent border-[var(--tg-theme-hint-color)]/50 text-[var(--tg-theme-button-color)] focus:ring-[var(--tg-theme-button-color)]" />
                                <span className="text-sm">{club}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">Niveau des partenaires</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" step="0.1" name="levelMin" value={formData.levelMin} onChange={handleChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" placeholder="Min" />
                        <input type="number" step="0.1" name="levelMax" value={formData.levelMax} onChange={handleChange} className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition" placeholder="Max" />
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-3 px-4 rounded-md flex items-center justify-center transition-opacity duration-300 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : "Publier ma disponibilité"}
                </button>
            </form>
        </div>
    );
};

export default AvailabilityForm;