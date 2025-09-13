import React, { useState } from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { CalendarPlusIcon } from './icons/UserPlusIcon';
import { PlusIcon } from './icons/PlusIcon';
import { useI18n } from '../hooks/useI18n';
import { PlayerProfile } from '../types';

type Tab = 'home' | 'tournaments' | 'clubs' | 'social';

interface BottomNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onCreateMatch: () => void;
  onCreateTournament: () => void;
  userProfile: PlayerProfile;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab, onCreateMatch, onCreateTournament, userProfile }) => {
  const { t } = useI18n();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const canCreateTournament = userProfile.adminOfClubId !== undefined || userProfile.organizerStatus === 'APPROVED';

  const handleCreateClick = () => {
    if (canCreateTournament) {
      setIsCreateMenuOpen(prev => !prev);
    } else {
      onCreateMatch();
    }
  };

  const navItems = [
    { id: 'home', label: t('mainTabs.home'), icon: HomeIcon },
    { id: 'tournaments', label: t('mainTabs.tournaments'), icon: TrophyIcon },
    { id: 'create', label: t('proposeMatchButton'), icon: CalendarPlusIcon, isCentral: true },
    { id: 'clubs', label: t('mainTabs.clubs'), icon: BuildingOfficeIcon },
    { id: 'social', label: t('mainTabs.social'), icon: UsersIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-secondary-bg-color)]/80 backdrop-blur-lg border-t border-[var(--tg-theme-hint-color)]/20 z-20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isCentral) {
            return (
              <div key={item.id} className="relative w-16 h-16 flex justify-center">
                {isCreateMenuOpen && (
                  <div className="absolute bottom-20 w-48 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg shadow-xl border border-[var(--tg-theme-hint-color)]/20 p-2 space-y-2">
                    <button onClick={() => { onCreateMatch(); setIsCreateMenuOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-[var(--tg-theme-hint-color)]/10 text-sm font-semibold">{t('createMenu.createMatch')}</button>
                    <button onClick={() => { onCreateTournament(); setIsCreateMenuOpen(false); }} className="w-full text-left p-2 rounded-md hover:bg-[var(--tg-theme-hint-color)]/10 text-sm font-semibold">{t('createMenu.createTournament')}</button>
                  </div>
                )}
                <button
                  onClick={handleCreateClick}
                  className="absolute -top-6 w-16 h-16 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                  aria-label={item.label}
                >
                  <PlusIcon className="w-8 h-8" />
                </button>
              </div>
            );
          }
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center w-full transition-colors ${isActive ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;