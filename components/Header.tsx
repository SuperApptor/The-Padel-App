
import React from 'react';
import { PadelIcon } from './icons/PadelIcon';
import { PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';
import { BellIcon } from './icons/BellIcon';

interface HeaderProps {
    profile: PlayerProfile;
    onProfileClick: () => void;
    onNotificationsClick: () => void;
    unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({ profile, onProfileClick, onNotificationsClick, unreadCount }) => {
  const { t } = useI18n();
  return (
    <header className="bg-[var(--tg-theme-secondary-bg-color)]/80 backdrop-blur-lg border-b border-[var(--tg-theme-hint-color)]/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <PadelIcon className="h-9 w-9 text-[var(--tg-theme-button-color)]"/>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--tg-theme-text-color)]">
            Padel Partner
          </h1>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={onNotificationsClick} className="relative p-2 rounded-full transition-colors hover:bg-[var(--tg-theme-hint-color)]/10">
                <BellIcon className="w-6 h-6"/>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            <button onClick={onProfileClick} className="flex items-center space-x-3 rounded-lg p-1.5 transition-colors hover:bg-[var(--tg-theme-hint-color)]/10">
                <div className="text-right">
                    <p className="font-bold text-sm text-[var(--tg-theme-text-color)]">{profile.name}</p>
                    <p className="text-xs font-semibold text-[var(--tg-theme-button-color)]">{t('common.level')} {profile.level.toFixed(2)}</p>
                </div>
                <img src={profile.avatarUrl} alt={profile.name} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--tg-theme-button-color)]/50" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;