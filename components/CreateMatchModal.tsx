import React, { useState, useMemo } from 'react';
import { PlayerProfile, PlayerAvailability, SuggestedPlayer, Match, AvailabilityType, Club, MatchType, Gender } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import SuggestedPlayerCard from './SuggestedPlayerCard';
import { useI18n } from '../hooks/useI18n';
import { DAYS_OF_WEEK } from '../constants';
import { CalendarIcon } from './icons/CalendarIcon';

interface CreateMatchModalProps {
  profile: PlayerProfile;
  availabilities: PlayerAvailability[];
  clubs: Club[];
  onClose: () => void;
  // Fix: Updated the `addMatch` prop to correctly handle invited players by accepting `invitedPlayers` as a second argument. This aligns with the component's two-step UI for creating a match and then inviting players, resolving a type mismatch with its usage in `App.tsx`.
  addMatch: (matchData: Omit<Match, 'id' | 'participants' | 'description' | 'format' | 'status' | 'invitedPlayerIds' | 'duration'>, invitedPlayers: SuggestedPlayer[]) => Promise<string | null>;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h < 23; h++) {
        for (let m = 0; m < 60; m += 15) {
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    return slots;
};
const timeSlots = generateTimeSlots();

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ profile, availabilities, clubs, onClose, addMatch }) => {
    const { t } = useI18n();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [matchDetails, setMatchDetails] = useState({
        clubId: profile.favoriteClubIds[0]?.toString() || (clubs.length > 0 ? clubs[0].id.toString() : ''),
        levelMin: (profile.level - 0.5 > 0 ? profile.level - 0.5 : 1).toFixed(1),
        levelMax: (profile.level + 0.5).toFixed(1),
        matchDate: getTodayString(),
        matchTime: '19:00',
        type: MatchType.OPEN,
    });

    const [invitedPlayers, setInvitedPlayers] = useState<SuggestedPlayer[]>([]);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setMatchDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const suggestedPlayers = useMemo(() => {
        if (step !== 2) return [];

        const matchDateTime = new Date(`${matchDetails.matchDate}T${matchDetails.matchTime}`);
        const matchDayIndex = (matchDateTime.getDay() + 6) % 7; // 0 = Monday
        const matchDay = DAYS_OF_WEEK[matchDayIndex];

        return availabilities.filter(av => {
            const player = av.player;
            if (player.telegram === profile.telegram) return false;
            if (player.level < Number(matchDetails.levelMin) || player.level > Number(matchDetails.levelMax)) return false;

            if (matchDetails.type === MatchType.MEN && player.gender !== Gender.MALE) return false;
            if (matchDetails.type === MatchType.WOMEN && player.gender !== Gender.FEMALE) return false;

            const avStartTime = parseInt(av.startTime.replace(':', ''));
            const avEndTime = parseInt(av.endTime.replace(':', ''));
            const matchTimeInt = parseInt(matchDetails.matchTime.replace(':', ''));

            if (matchTimeInt < avStartTime || matchTimeInt >= avEndTime) return false;
            if (!av.clubIds.includes(Number(matchDetails.clubId))) return false;

            switch (av.type) {
                case AvailabilityType.ONE_TIME:
                    return av.date === matchDetails.matchDate;
                case AvailabilityType.RECURRING:
                    return av.days.includes(matchDay);
                case AvailabilityType.DATE_RANGE:
                    if (!av.startDate || !av.endDate) return false;
                    const startDate = new Date(av.startDate);
                    const endDate = new Date(av.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    return matchDateTime >= startDate && matchDateTime <= endDate && av.days.includes(matchDay);
                default:
                    return false;
            }
        }).map(av => ({ profile: av.player, availabilityId: av.id }));
    }, [step, matchDetails, availabilities, profile.telegram]);

    const handleInviteToggle = (player: SuggestedPlayer) => {
        setInvitedPlayers(prev =>
            prev.some(p => p.profile.telegram === player.profile.telegram)
            ? prev.filter(p => p.profile.telegram !== player.profile.telegram)
            : [...prev, player]
        );
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!matchDetails.clubId || !matchDetails.matchDate || !matchDetails.matchTime) {
            setError(t('createMatchModal.errors.fillAllFields'));
            return;
        }

        const selectedDateTime = new Date(`${matchDetails.matchDate}T${matchDetails.matchTime}`);
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

        if (selectedDateTime < oneHourFromNow) {
            setError(t('createMatchModal.errors.timeMargin'));
            return;
        }

        setStep(2);
    };

    const handleCreateMatch = async () => {
        setIsLoading(true);
        setError(null);
        
        const matchData = {
            clubId: Number(matchDetails.clubId),
            levelMin: Number(matchDetails.levelMin),
            levelMax: Number(matchDetails.levelMax),
            matchDate: matchDetails.matchDate,
            matchTime: matchDetails.matchTime,
            type: matchDetails.type,
            duration: 90, // Added duration to satisfy Match type
        };

        const apiError = await addMatch(matchData, invitedPlayers);

        setIsLoading(false);
        if (apiError) {
            setError(apiError);
        } else {
            onClose();
        }
    };

    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-sm text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">{step === 1 ? t('createMatchModal.titleStep1') : t('createMatchModal.titleStep2')}</h2>
                    <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleNextStep} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="clubId" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('common.club')}</label>
                                <select name="clubId" id="clubId" value={matchDetails.clubId} onChange={handleDetailsChange} className={`${inputClass} appearance-none`} style={selectStyle}>
                                    {clubs.map(club => <option key={club.id} value={club.id}>{club.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('createMatchModal.matchType')}</label>
                                <select name="type" id="type" value={matchDetails.type} onChange={handleDetailsChange} className={`${inputClass} appearance-none`} style={selectStyle}>
                                    {Object.values(MatchType).map(type => <option key={type} value={type}>{t(`matchType.${type}`)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="matchDate" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('common.date')}</label>
                                <div className="date-input-wrapper">
                                    <input type="date" name="matchDate" id="matchDate" value={matchDetails.matchDate} min={getTodayString()} onChange={handleDetailsChange} className="date-input" />
                                    <CalendarIcon className="date-input-icon w-5 h-5"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="matchTime" className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('common.time')}</label>
                                <select name="matchTime" id="matchTime" value={matchDetails.matchTime} onChange={handleDetailsChange} className={`${inputClass} appearance-none`} style={selectStyle}>
                                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">{t('common.levelRange')}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="number" step="0.1" name="levelMin" value={matchDetails.levelMin} onChange={handleDetailsChange} placeholder={t('common.min')} className={inputClass} />
                                <input type="number" step="0.1" name="levelMax" value={matchDetails.levelMax} onChange={handleDetailsChange} placeholder={t('common.max')} className={inputClass} />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                            <button type="submit" className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('common.next')}</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="mb-2 text-sm text-center text-[var(--tg-theme-hint-color)]">
                            {suggestedPlayers.length > 0
                                ? t('createMatchModal.suggestionsFound', { count: suggestedPlayers.length })
                                : t('createMatchModal.noSuggestions')}
                        </div>
                        <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                            {suggestedPlayers.map(player => (
                                <SuggestedPlayerCard
                                    key={player.profile.telegram}
                                    player={player}
                                    onInviteToggle={handleInviteToggle}
                                    isInvited={invitedPlayers.some(p => p.profile.telegram === player.profile.telegram)}
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                        <div className="flex gap-4 pt-4 mt-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                            <button type="button" onClick={() => setStep(1)} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.back')}</button>
                            <button type="button" onClick={handleCreateMatch} disabled={isLoading} className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md flex justify-center items-center disabled:opacity-50">
                                {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : t('createMatchModal.createMatchButton', { count: invitedPlayers.length })}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateMatchModal;