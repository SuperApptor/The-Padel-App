

import React, { useState, useMemo } from 'react';
import { PlayerProfile, Club } from '../types';
import { useI18n } from '../hooks/useI18n';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { SearchIcon } from './icons/SearchIcon';

interface SuperAdminModalProps {
    userProfile: PlayerProfile;
    allPlayers: PlayerProfile[];
    allClubs: Club[];
    onClose: () => void;
    onApproveOrganizer: (userId: string) => void;
    onRejectOrganizer: (userId: string) => void;
    onCreateClub: (clubName: string, adminId?: string) => void;
    onAssignAdmin: (clubId: number, adminId: string) => void;
    onOpenAdminEditProfile: (player: PlayerProfile) => void;
}

type AdminTab = 'clubs' | 'organizers' | 'users';

const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
    userProfile,
    allPlayers,
    allClubs,
    onClose,
    onApproveOrganizer,
    onRejectOrganizer,
    onCreateClub,
    onAssignAdmin,
    onOpenAdminEditProfile,
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [newClubName, setNewClubName] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [assigningAdminFor, setAssigningAdminFor] = useState<number | 'new' | null>(null);

    const organizerRequests = allPlayers.filter(p => p.organizerStatus === 'PENDING');

    const filteredUsers = useMemo(() => {
        const baseList = assigningAdminFor !== null
            ? allPlayers // Include self when assigning
            : allPlayers.filter(p => p.telegram !== userProfile.telegram); // Exclude self in "All Users" tab

        if (!userSearch) return baseList;
        return baseList.filter(p => p.name.toLowerCase().includes(userSearch.toLowerCase()));
    }, [userSearch, allPlayers, userProfile.telegram, assigningAdminFor]);
    
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-sm text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";
    
    const tabButtonStyle = (tabName: AdminTab, icon: React.FC<React.SVGProps<SVGSVGElement>>) => {
        const Icon = icon;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex-1 py-2 px-4 text-xs sm:text-sm font-semibold transition-colors rounded-lg flex items-center justify-center gap-2 ${
                    activeTab === tabName 
                    ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' 
                    : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/10'
                }`}
            >
                <Icon className="w-5 h-5" />
                {t(`superAdminModal.tabs.${tabName}`)}
            </button>
        );
    }
    
    const handleCreateClub = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClubName.trim()) {
            setAssigningAdminFor('new');
        }
    };
    
    const handleSelectAdmin = (admin: PlayerProfile) => {
        if (assigningAdminFor === 'new') {
            onCreateClub(newClubName, admin.telegram);
        } else if (assigningAdminFor) {
            onAssignAdmin(assigningAdminFor, admin.telegram);
        }
        setAssigningAdminFor(null);
        setNewClubName('');
        setUserSearch('');
    };

    const renderClubsTab = () => (
        <div>
            <form onSubmit={handleCreateClub} className="flex gap-2 mb-4">
                <input type="text" value={newClubName} onChange={e => setNewClubName(e.target.value)} placeholder={t('superAdminModal.clubNamePlaceholder')} className={inputClass} />
                <button type="submit" className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2 px-4 rounded-md">{t('superAdminModal.createClub')}</button>
            </form>
            <div className="space-y-2">
                {allClubs.map(club => {
                    const admin = allPlayers.find(p => p.adminOfClubId === club.id);
                    return (
                        <div key={club.id} className="p-3 bg-[var(--tg-theme-bg-color)] rounded-lg flex items-center justify-between">
                            <p className="font-semibold">{club.name}</p>
                            <div className="text-right">
                                {admin ? <p className="text-xs">{admin.name}</p> : <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('superAdminModal.noAdmin')}</p>}
                                <button onClick={() => setAssigningAdminFor(club.id)} className="text-xs text-[var(--tg-theme-link-color)]">{t('superAdminModal.assignAdmin')}</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    const renderOrganizersTab = () => (
        organizerRequests.length > 0 ? (
            <div className="space-y-2">
                {organizerRequests.map(player => (
                    <div key={player.telegram} className="p-3 bg-[var(--tg-theme-bg-color)] rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-sm">{player.name}</p>
                                <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onApproveOrganizer(player.telegram)} className="bg-green-500/80 text-white font-bold text-sm px-3 py-1.5 rounded-md">{t('common.approve')}</button>
                            <button onClick={() => onRejectOrganizer(player.telegram)} className="bg-red-500/80 text-white font-bold text-sm px-3 py-1.5 rounded-md">{t('common.reject')}</button>
                        </div>
                    </div>
                ))}
            </div>
        ) : <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-10">{t('superAdminModal.noRequests')}</p>
    );

    const renderUsersTab = () => (
         <div>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/></div>
                <input type="text" placeholder={t('superAdminModal.searchUserPlaceholder')} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
             <div className="space-y-2">
                {filteredUsers.length > 0 ? filteredUsers.map(player => {
                    const clubAdmin = player.adminOfClubId ? allClubs.find(c => c.id === player.adminOfClubId) : null;
                    const isOrganizer = player.organizerStatus === 'APPROVED';

                    return (
                        <button 
                            key={player.telegram} 
                            onClick={() => onOpenAdminEditProfile(player)}
                            className="w-full text-left p-3 bg-[var(--tg-theme-bg-color)] rounded-lg hover:bg-[var(--tg-theme-hint-color)]/10 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-bold text-sm">{player.name}</p>
                                        <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                            {(clubAdmin || isOrganizer) && (
                                <div className="mt-2 pt-2 border-t border-[var(--tg-theme-hint-color)]/10 flex flex-wrap gap-2">
                                    {clubAdmin && (
                                        <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                            {t('superAdminModal.roleAdmin', { clubName: clubAdmin.name })}
                                        </span>
                                    )}
                                    {isOrganizer && (
                                        <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                            {t('superAdminModal.roleOrganizer')}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    )
                }) : <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-10">{t('superAdminModal.noUsers')}</p>}
             </div>
        </div>
    );
    
    if (assigningAdminFor !== null) {
        return (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                     <div className="p-6 pb-4 flex-shrink-0">
                         <h3 className="font-bold">{t('superAdminModal.assignAdmin')}</h3>
                         <div className="relative mt-2">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/></div>
                             <input type="text" placeholder={t('superAdminModal.searchUserPlaceholder')} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className={`${inputClass} pl-10`} />
                         </div>
                     </div>
                     <div className="p-6 pt-0 flex-grow overflow-y-auto min-h-0 space-y-2">
                          {filteredUsers.map(player => (
                            <div key={player.telegram} onClick={() => handleSelectAdmin(player)} className="p-2 bg-[var(--tg-theme-bg-color)] rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[var(--tg-theme-hint-color)]/10">
                                <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-sm">{player.name}</p>
                                    <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                                </div>
                            </div>
                          ))}
                     </div>
                     <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                         <button onClick={() => setAssigningAdminFor(null)} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                     </div>
                </div>
             </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-lg border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('superAdminModal.title')}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl">
                        {tabButtonStyle('clubs', BuildingOfficeIcon)}
                        {tabButtonStyle('organizers', UserGroupIcon)}
                        {tabButtonStyle('users', UsersIcon)}
                    </div>
                </div>

                <div className="p-6 pt-2 flex-grow overflow-y-auto min-h-[400px]">
                    {activeTab === 'clubs' && renderClubsTab()}
                    {activeTab === 'organizers' && renderOrganizersTab()}
                    {activeTab === 'users' && renderUsersTab()}
                </div>

                <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                    <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminModal;