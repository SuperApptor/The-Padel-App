import React from 'react';
import { PlayerAvailability, AvailabilityType, PlayerProfile, Club } from '../types';
import { TelegramIcon } from './icons/TelegramIcon';
import { AddUserIcon } from './icons/AddUserIcon';
import { useI18n } from '../hooks/useI18n';
import { PadelPlusIcon } from './icons/PadelPlusIcon';

interface AvailabilityCardProps {
  availability: PlayerAvailability;
  userProfile: PlayerProfile;
  clubs: Club[];
  onAddFriend: (friendId: string) => void;
  onCreateMatch: () => void;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ availability, userProfile, clubs, onAddFriend, onCreateMatch }) => {
  const { t, lang } = useI18n();
  const { player, clubIds, levelMin, levelMax } = availability;
  const isSelf = userProfile.telegram === player.telegram;
  const isFriend = userProfile.friends.includes(player.telegram);
  const requestSent = userProfile.sentFriendRequests.includes(player.telegram);
  const requestReceived = userProfile.friendRequests.some(req => req.from.telegram === player.telegram);

  const clubNames = clubIds.map(id => clubs.find(c => c.id === id)?.name).filter(Boolean).join(', ');

  const formatAvailabilityDate = (availability: PlayerAvailability) => {
    const { type, days, date, startDate, endDate, startTime, endTime } = availability;
    const timeRange = `${startTime} - ${endTime}`;
    const translatedDays = days.map(day => t(`days.${day.toLowerCase()}`)).join(', ');

    switch (type) {
        case AvailabilityType.ONE_TIME:
            if (!date) return timeRange;
            const oneTimeDate = new Date(date + 'T00:00:00');
            return t('availabilityCard.oneTimeFormat', { date: oneTimeDate.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' }), timeRange });
        case AvailabilityType.DATE_RANGE:
            if (!startDate || !endDate) return `${translatedDays} • ${timeRange}`;
            const start = new Date(startDate + 'T00:00:00').toLocaleDateString(lang, { day: '2-digit', month: '2-digit' });
            const end = new Date(endDate + 'T00:00:00').toLocaleDateString(lang, { day: '2-digit', month: '2-digit' });
            return t('availabilityCard.dateRangeFormat', { days: translatedDays, timeRange, startDate: start, endDate: end });
        case AvailabilityType.RECURRING:
        default:
            return `${translatedDays} • ${timeRange}`;
    }
  };

  const iconButtonBaseClass = "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md";
  const primaryButtonClass = `bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] hover:opacity-80`;
  const secondaryButtonClass = `bg-[var(--tg-theme-secondary-bg-color)] border-2 border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)] hover:bg-[var(--tg-theme-button-color)] hover:text-[var(--tg-theme-button-text-color)] disabled:opacity-60 disabled:cursor-not-allowed disabled:border-[var(--tg-theme-hint-color)] disabled:text-[var(--tg-theme-hint-color)] disabled:bg-transparent`;

  return (
    <div className="bg-[var(--tg-theme-secondary-bg-color)] p-5 rounded-xl border border-[var(--tg-theme-hint-color)]/20 shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-[var(--tg-theme-button-color)]/50">
      <div>
        <div className="flex items-center space-x-4">
            <img src={player.avatarUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-[var(--tg-theme-button-color)]/50" />
            <div>
                <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)]">{player.name}</h3>
                <p className="font-semibold text-[var(--tg-theme-button-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                <p className="text-sm text-[var(--tg-theme-hint-color)]">{t(`handedness.${player.handedness}`)} / {t(`side.playerOf`)} {t(`side.${player.side}`)}</p>
            </div>
        </div>
        
        <div className="mt-4 border-t border-[var(--tg-theme-hint-color)]/20 pt-4 space-y-3">
            <div>
                <p className="text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">{t('availabilityCard.availabilities')}</p>
                <p className="font-semibold">{formatAvailabilityDate(availability)}</p>
            </div>
             <div>
                <p className="text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">{t('availabilityCard.favoriteClubs')}</p>
                <p className="font-semibold">{clubNames}</p>
            </div>
             <div>
                <p className="text-xs font-semibold uppercase text-[var(--tg-theme-hint-color)]">{t('availabilityCard.lookingForLevel')}</p>
                <p className="font-bold text-[var(--tg-theme-text-color)] bg-[var(--tg-theme-hint-color)]/20 px-2 py-0.5 rounded inline-block">
                    {levelMin.toFixed(1)} - {levelMax.toFixed(1)}
                </p>
            </div>
        </div>

      </div>

      <div className="mt-5 flex items-center justify-center gap-6">
        { !isSelf && (
            <button
                onClick={!isFriend && !requestSent && !requestReceived ? () => onAddFriend(player.telegram) : undefined}
                disabled={isFriend || requestSent || requestReceived}
                title={isFriend ? t('socialTabs.myFriends') : requestSent ? t('addFriend.requestSent') : requestReceived ? t('socialTabs.requests') : t('availabilityCard.addFriendTooltip')}
                className={`${iconButtonBaseClass} ${secondaryButtonClass}`}
            >
                <AddUserIcon className="w-5 h-5" />
            </button>
        )}
        <button
            onClick={onCreateMatch}
            title={t('availabilityCard.proposeMatchTooltip')}
            className={`${iconButtonBaseClass} ${primaryButtonClass}`}
        >
            <PadelPlusIcon className="w-5 h-5" />
        </button>
         <a
            href={`https://t.me/${player.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            title={t('availabilityCard.contactTooltip')}
            className={`${iconButtonBaseClass} ${secondaryButtonClass} border-transparent bg-sky-500 text-white hover:bg-sky-600`}
        >
            <TelegramIcon className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default AvailabilityCard;