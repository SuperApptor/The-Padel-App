import React, { useState, useMemo } from 'react';
import { Tournament, TournamentCategory, PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SearchIcon } from './icons/SearchIcon';

interface RegisterTournamentModalProps {
    tournament: Tournament;
    category: TournamentCategory;
    userProfile: PlayerProfile;
    friends: PlayerProfile[];
    onClose: () => void;
    onRegister: (tournamentId: number, categoryId: number, partnerId?: string) => void;
}

const RegisterTournamentModal: React.FC<RegisterTournamentModalProps> = ({ tournament, category, userProfile, friends, onClose, onRegister }) => {
    const { t } = useI18n();
    const [mode, setMode] = useState<'partner' | 'alone'>('partner');
    const [selectedPartner, setSelectedPartner] = useState<PlayerProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFriends = useMemo(() => {
        return friends.filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [friends, searchTerm]);

    const isAlreadyRegistered = tournament.registrations.some(r => r.player1Id === userProfile.telegram || r.player2Id === userProfile.telegram);

    if (isAlreadyRegistered) {
         return (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl p-6 w-full max-w-sm border border-[var(--tg-theme-hint-color)]/20 shadow-2xl">
                    <p className="text-center">{t('registerTournamentModal.alreadyRegistered')}</p>
                    <button onClick={onClose} className="mt-4 w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.close')}</button>
                </div>
            </div>
         )
    }

    const handleSubmit = () => {
        if (mode === 'partner' && selectedPartner) {
            onRegister(tournament.id, category.id, selectedPartner.telegram);
        } else if (mode === 'alone') {
            onRegister(tournament.id, category.id);
        }
    };
    
    const tabButtonStyle = (tabName: 'partner' | 'alone') => 
        `flex-1 py-2 px-4 text-sm font-semibold transition-colors rounded-lg flex items-center justify-center gap-2 ${
            mode === tabName 
            ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' 
            : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/10'
        }`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold truncate">{t('registerTournamentModal.title', { categoryName: category.name })}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl">
                        <button onClick={() => setMode('partner')} className={tabButtonStyle('partner')}>{t('registerTournamentModal.withPartner')}</button>
                        <button onClick={() => setMode('alone')} className={tabButtonStyle('alone')}>{t('registerTournamentModal.alone')}</button>
                    </div>
                </div>

                <div className="p-6 pt-2 flex-grow overflow-y-auto min-h-0">
                    {mode === 'partner' ? (
                        <div className="flex flex-col h-full">
                           <div className="relative mb-3 flex-shrink-0">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/>
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('registerTournamentModal.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md py-2 pl-10 pr-4 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition"
                                />
                            </div>
                            <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                               {filteredFriends.length > 0 ? filteredFriends.map(friend => (
                                   <div key={friend.telegram} onClick={() => setSelectedPartner(friend)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedPartner?.telegram === friend.telegram ? 'bg-[var(--tg-theme-button-color)]/30' : 'bg-[var(--tg-theme-bg-color)] hover:bg-[var(--tg-theme-hint-color)]/10'}`}>
                                       <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full object-cover"/>
                                       <div>
                                           <p className="font-bold text-sm">{friend.name}</p>
                                           <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {friend.level.toFixed(2)}</p>
                                       </div>
                                   </div>
                               )) : (
                                   <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-8">{t('registerTournamentModal.noFriends')}</p>
                               )}
                           </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 bg-[var(--tg-theme-bg-color)] rounded-lg">
                            <p>{t('registerTournamentModal.aloneDescription')}</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0 flex gap-4">
                    <button type="button" onClick={onClose} className="w-full bg-transparent border border-[var(--tg-theme-hint-color)]/50 font-bold py-2.5 px-4 rounded-md">{t('common.cancel')}</button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={mode === 'partner' && !selectedPartner}
                        className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md disabled:opacity-50"
                    >
                        {mode === 'partner' ? t('registerTournamentModal.sendInvitation') : t('registerTournamentModal.confirmRegistration')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterTournamentModal;