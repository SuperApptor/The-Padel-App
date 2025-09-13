
import React from 'react';
import { PlayerProfile } from '../types';
import { useI18n } from '../hooks/useI18n';

interface FriendListProps {
    friends: PlayerProfile[];
    onOpenProfile: (friend: PlayerProfile) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, onOpenProfile }) => {
    const { t } = useI18n();
    if (friends.length === 0) {
        return (
            <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('friendList.noFriendsTitle')}</h3>
                <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('friendList.noFriendsSubtitle')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {friends.map(friend => (
                <button 
                    key={friend.telegram} 
                    onClick={() => onOpenProfile(friend)}
                    className="w-full flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg border border-[var(--tg-theme-hint-color)]/10 text-left transition-colors hover:bg-[var(--tg-theme-hint-color)]/10"
                >
                    <div className="flex items-center gap-3">
                        <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full object-cover"/>
                        <div>
                            <p className="font-bold text-md text-[var(--tg-theme-text-color)]">{friend.name}</p>
                            <p className="text-sm font-semibold text-[var(--tg-theme-button-color)]">{t('common.level')} {friend.level.toFixed(2)}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default FriendList;