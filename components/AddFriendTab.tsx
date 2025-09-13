import React, { useState, useMemo } from 'react';
import { PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SearchIcon } from './icons/SearchIcon';
import { AddUserIcon } from './icons/AddUserIcon';

interface AddFriendTabProps {
    profile: PlayerProfile;
    allPlayers: PlayerProfile[];
    onAddFriend: (friendId: string) => void;
}

const AddFriendTab: React.FC<AddFriendTabProps> = ({ profile, allPlayers, onAddFriend }) => {
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        return allPlayers.filter(player =>
            player.telegram !== profile.telegram &&
            player.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allPlayers, profile.telegram]);

    const getButtonState = (player: PlayerProfile) => {
        if (profile.friends.includes(player.telegram)) {
            return { text: t('socialTabs.myFriends'), disabled: true, className: "bg-transparent text-[var(--tg-theme-hint-color)]" };
        }
        if (profile.sentFriendRequests.includes(player.telegram)) {
            return { text: t('addFriend.requestSent'), disabled: true, className: "bg-transparent text-[var(--tg-theme-hint-color)]" };
        }
        if (profile.friendRequests.some(req => req.from.telegram === player.telegram)) {
            return { text: t('socialTabs.requests'), disabled: false, className: "bg-green-500/80 text-white hover:bg-green-500" };
        }
        return { text: t('addFriend.addFriend'), disabled: false, className: "bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] hover:opacity-80" };
    };

    return (
        <div>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-[var(--tg-theme-hint-color)]"/>
                </div>
                <input
                    type="text"
                    placeholder={t('addFriend.searchPlayersPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[var(--tg-theme-secondary-bg-color)] border border-[var(--tg-theme-hint-color)]/50 rounded-md py-2 pl-10 pr-4 text-[var(--tg-theme-text-color)] placeholder:text-[var(--tg-theme-hint-color)] focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:outline-none transition"
                />
            </div>

            <div className="space-y-3">
                {searchTerm.trim() && searchResults.length === 0 && (
                     <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                        <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('addFriend.noPlayersFound')}</h3>
                    </div>
                )}
                {searchResults.map(player => {
                    const { text, disabled, className } = getButtonState(player);
                    return (
                        <div key={player.telegram} className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg border border-[var(--tg-theme-hint-color)]/10">
                            <div className="flex items-center gap-3">
                                <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-md text-[var(--tg-theme-text-color)]">{player.name}</p>
                                    <p className="text-sm font-semibold text-[var(--tg-theme-button-color)]">{t('common.level')} {player.level.toFixed(2)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onAddFriend(player.telegram)}
                                disabled={disabled}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition disabled:opacity-70 ${className}`}
                            >
                                {text}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AddFriendTab;
