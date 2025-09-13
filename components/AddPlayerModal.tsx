import React, { useState, useMemo } from 'react';
import { Match, PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SearchIcon } from './icons/SearchIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AddPlayerModalProps {
    match: Match;
    slotIndex: number;
    allPlayers: PlayerProfile[];
    onClose: () => void;
    onAddPlayer: (playerData: PlayerProfile | { name: string, level: number }, matchId: number, slotIndex: number) => void;
}

type AddPlayerTab = 'find' | 'guest';

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ match, slotIndex, allPlayers, onClose, onAddPlayer }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<AddPlayerTab>('find');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
    const [guestName, setGuestName] = useState('');
    const [guestLevel, setGuestLevel] = useState('');
    const [error, setError] = useState<string | null>(null);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const currentParticipantIds = match.participants.map(p => p?.telegram).filter(Boolean);
        return allPlayers.filter(player =>
            !currentParticipantIds.includes(player.telegram) &&
            player.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allPlayers, match.participants]);

    const isLevelMismatched = useMemo(() => {
        if (!selectedPlayer) return false;
        return selectedPlayer.level < match.levelMin || selectedPlayer.level > match.levelMax;
    }, [selectedPlayer, match.levelMin, match.levelMax]);

    const handleAddSelectedPlayer = (force = false) => {
        if (!selectedPlayer) return;
        if (isLevelMismatched && !force) return;
        onAddPlayer(selectedPlayer, match.id, slotIndex);
    };

    const handleAddGuest = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!guestName.trim() || !guestLevel) {
            setError("Please fill in both name and level.");
            return;
        }
        const level = parseFloat(guestLevel);
        if (isNaN(level) || level < 0 || level > 10) {
            setError("Please enter a valid level.");
            return;
        }
        onAddPlayer({ name: guestName.trim(), level }, match.id, slotIndex);
    };

    const tabButtonStyle = (tabName: AddPlayerTab) =>
        `flex-1 py-2 text-sm font-semibold transition-colors rounded-lg ${
            activeTab === tabName
            ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]'
            : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/10'
        }`;
    
    const inputClass = "w-full bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md px-3 py-2 text-sm text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl w-full max-w-md border border-[var(--tg-theme-hint-color)]/20 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('addPlayerModal.title')}</h2>
                        <button onClick={onClose} className="text-2xl text-[var(--tg-theme-hint-color)]">&times;</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--tg-theme-bg-color)] rounded-xl">
                        <button onClick={() => setActiveTab('find')} className={tabButtonStyle('find')}>{t('addPlayerModal.findPlayerTab')}</button>
                        <button onClick={() => setActiveTab('guest')} className={tabButtonStyle('guest')}>{t('addPlayerModal.addGuestTab')}</button>
                    </div>
                </div>

                <div className="p-6 pt-2 flex-grow overflow-y-auto min-h-0">
                    {activeTab === 'find' && (
                        <div className="flex flex-col h-full">
                            <div className="relative mb-3 flex-shrink-0">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/></div>
                                <input type="text" placeholder={t('addPlayerModal.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10`} />
                            </div>
                            <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                                {searchTerm.trim() && searchResults.length === 0 && <p className="text-center text-sm text-[var(--tg-theme-hint-color)] py-8">{t('addPlayerModal.noResults')}</p>}
                                {searchResults.map(player => (
                                    <div key={player.telegram} onClick={() => setSelectedPlayer(player)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedPlayer?.telegram === player.telegram ? 'bg-[var(--tg-theme-button-color)]/30' : 'bg-[var(--tg-theme-bg-color)] hover:bg-[var(--tg-theme-hint-color)]/10'}`}>
                                        <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <div>
                                            <p className="font-bold text-sm">{player.name}</p>
                                            <p className="text-xs text-[var(--tg-theme-hint-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             {selectedPlayer && isLevelMismatched && (
                                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs rounded-lg">
                                    {t('addPlayerModal.levelWarning', { playerLevel: selectedPlayer.level.toFixed(2), minLevel: match.levelMin.toFixed(1), maxLevel: match.levelMax.toFixed(1) })}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'guest' && (
                        <form onSubmit={handleAddGuest} className="space-y-4">
                             <div>
                                <label htmlFor="guestName" className="block text-sm font-medium mb-1">{t('addPlayerModal.guestNameLabel')}</label>
                                <input id="guestName" type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder={t('addPlayerModal.guestNamePlaceholder')} className={inputClass} required/>
                             </div>
                              <div>
                                <label htmlFor="guestLevel" className="block text-sm font-medium mb-1">{t('addPlayerModal.guestLevelLabel')}</label>
                                <input id="guestLevel" type="number" step="0.1" value={guestLevel} onChange={e => setGuestLevel(e.target.value)} placeholder="e.g., 6.5" className={inputClass} required/>
                             </div>
                             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                             <button type="submit" className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md">{t('addPlayerModal.addPlayerButton')}</button>
                        </form>
                    )}
                </div>
                
                {activeTab === 'find' && (
                     <div className="p-4 border-t border-[var(--tg-theme-hint-color)]/20 flex-shrink-0">
                         <button
                            type="button"
                            onClick={() => handleAddSelectedPlayer(isLevelMismatched)}
                            disabled={!selectedPlayer}
                            className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-2.5 px-4 rounded-md disabled:opacity-50"
                        >
                            {isLevelMismatched ? t('addPlayerModal.forceAddButton') : t('addPlayerModal.addPlayerButton')}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AddPlayerModal;