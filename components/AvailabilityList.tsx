

import React, { useState, useMemo } from 'react';
import { PlayerAvailability, PlayerProfile, Club, AvailabilityType } from '../types';
import AvailabilityCard from './AvailabilityCard';
import { SearchIcon } from './icons/SearchIcon';
import { useI18n } from '../hooks/useI18n';
import { DAYS_OF_WEEK } from '../constants';

interface AvailabilityListProps {
  availabilities: PlayerAvailability[];
  isLoading: boolean;
  userProfile: PlayerProfile;
  clubs: Club[];
  onAddFriend: (friendId: string) => void;
  onCreateMatch: () => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] p-5 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-[var(--tg-theme-hint-color)]/30"></div>
        <div className="flex-1 space-y-2">
            <div className="h-5 bg-[var(--tg-theme-hint-color)]/30 rounded w-3/4"></div>
            <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded"></div>
        <div className="h-4 bg-[var(--tg-theme-hint-color)]/30 rounded w-5/6"></div>
      </div>
      <div className="mt-5 h-10 bg-[var(--tg-theme-hint-color)]/30 rounded-md w-full"></div>
    </div>
);

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


const AvailabilityList: React.FC<AvailabilityListProps> = ({ availabilities, isLoading, userProfile, clubs, onAddFriend, onCreateMatch }) => {
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const filteredAvailabilities = useMemo(() => {
        // Initial filter: Show only players available at one of the user's favorite clubs.
        let results = availabilities.filter(av =>
            av.clubIds.some(clubId => userProfile.favoriteClubIds.includes(clubId))
        );

        // Further filter by text search
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            results = results.filter(av => {
                const clubNames = av.clubIds.map(id => clubs.find(c => c.id === id)?.name || '').join(' ').toLowerCase();
                return (
                    av.player.name.toLowerCase().includes(search) ||
                    clubNames.includes(search)
                );
            });
        }

        // Further filter by date and time
        if (selectedDate && selectedTime) {
            const filterDateTime = new Date(`${selectedDate}T00:00:00`);
            const filterDayIndex = (filterDateTime.getDay() + 6) % 7;
            const filterDay = DAYS_OF_WEEK[filterDayIndex];
            const filterTimeInt = parseInt(selectedTime.replace(':', ''), 10);

            results = results.filter(av => {
                const avStartTimeInt = parseInt(av.startTime.replace(':', ''), 10);
                const avEndTimeInt = parseInt(av.endTime.replace(':', ''), 10);

                if (filterTimeInt < avStartTimeInt || filterTimeInt >= avEndTimeInt) {
                    return false;
                }

                switch (av.type) {
                    case AvailabilityType.ONE_TIME:
                        return av.date === selectedDate;
                    case AvailabilityType.RECURRING:
                        return av.days.includes(filterDay);
                    case AvailabilityType.DATE_RANGE: {
                        if (!av.startDate || !av.endDate) return false;
                        return selectedDate >= av.startDate && selectedDate <= av.endDate && av.days.includes(filterDay);
                    }
                    default:
                        return false;
                }
            });
        }
        
        return results;
    }, [availabilities, searchTerm, selectedDate, selectedTime, clubs, userProfile.favoriteClubIds]);
    
    const handleClearFilters = () => {
        setSelectedDate('');
        setSelectedTime('');
    };

    const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${(window.Telegram?.WebApp?.themeParams?.hint_color || '#9ca3af').substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    const selectClassName = `${inputClass} appearance-none`;

  return (
    <div>
       <div className="mb-6 space-y-3 bg-[var(--tg-theme-secondary-bg-color)] p-4 rounded-lg border border-[var(--tg-theme-hint-color)]/20">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/>
                </div>
                <input
                    type="text"
                    placeholder={t('availabilityList.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md py-2 pl-10 pr-4 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                    type="date"
                    aria-label={t('availabilityList.filterByDate')}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={inputClass}
                />
                <select 
                    aria-label={t('availabilityList.filterByTime')}
                    value={selectedTime} 
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className={selectClassName} 
                    style={selectStyle}
                >
                    <option value="">{t('availabilityList.anyTime')}</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                <button
                    onClick={handleClearFilters}
                    className="bg-transparent border border-[var(--tg-theme-hint-color)]/50 text-[var(--tg-theme-text-color)] font-semibold py-2 px-4 rounded-md transition-colors hover:bg-[var(--tg-theme-hint-color)]/10"
                >
                    {t('availabilityList.clearFilters')}
                </button>
            </div>
        </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
        </div>
      )}
      {!isLoading && filteredAvailabilities.length === 0 && (
         <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
            <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('availabilityList.noPlayersTitle')}</h3>
            <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('availabilityList.noPlayersSubtitle')}</p>
        </div>
      )}
      {!isLoading && filteredAvailabilities.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAvailabilities.map((availability) => (
              <AvailabilityCard key={availability.id} availability={availability} userProfile={userProfile} onAddFriend={onAddFriend} clubs={clubs} onCreateMatch={onCreateMatch} />
            ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityList;