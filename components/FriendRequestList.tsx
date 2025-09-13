
import React from 'react';
import { FriendRequest } from '../types';
import { useI18n } from '../hooks/useI18n';

interface FriendRequestListProps {
    requests: FriendRequest[];
    onFriendRequest: (friendId: string, action: 'accept' | 'decline') => void;
}

const FriendRequestList: React.FC<FriendRequestListProps> = ({ requests, onFriendRequest }) => {
    const { t } = useI18n();
    if (requests.length === 0) {
        return (
            <div className="text-center py-16 bg-[var(--tg-theme-secondary-bg-color)] rounded-xl border border-[var(--tg-theme-hint-color)]/20">
                <h3 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">{t('friendRequestList.noRequestsTitle')}</h3>
                <p className="text-[var(--tg-theme-hint-color)] mt-2">{t('friendRequestList.noRequestsSubtitle')}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {requests.map(req => (
                <div key={req.from.telegram} className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg border border-[var(--tg-theme-hint-color)]/10">
                    <div className="flex items-center gap-3">
                        <img src={req.from.avatarUrl} alt={req.from.name} className="w-12 h-12 rounded-full object-cover"/>
                        <div>
                            <p className="font-bold text-md text-[var(--tg-theme-text-color)]">{req.from.name}</p>
                            <p className="text-sm font-semibold text-[var(--tg-theme-hint-color)]">{t('common.level')} {req.from.level.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onFriendRequest(req.from.telegram, 'accept')} className="bg-green-500/80 text-white font-bold text-sm px-3 py-1.5 rounded-md hover:bg-green-500 transition">
                            {t('common.accept')}
                        </button>
                        <button onClick={() => onFriendRequest(req.from.telegram, 'decline')} className="bg-red-500/80 text-white font-bold text-sm px-3 py-1.5 rounded-md hover:bg-red-500 transition">
                            {t('common.decline')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendRequestList;